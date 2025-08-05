<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div
    v-if="isLandingPage"
    class="flex h-screen flex-col"
    data-testid="landing-page"
  >
    <LandingPage />
  </div>

  <div
    v-if="hasUrlError"
    class="flex h-screen flex-col"
    data-testid="error-page"
  >
    <Error :text="getUrlClassification.error" />
  </div>

  <div v-if="!sessionEnabled && !hasUrlError">
    <NoClassMessage />
  </div>

  <div v-else>
    <div>
      <Signin
        v-if="isTypeSignIn && doesGroupExist"
        :is_type_signin="isTypeSignIn"
        :auth_type="getAuthTypes"
        :enable_signup="isSignupEnabled"
        :enable_popup="isPopUpFormEnabled"
        data-testid="signin-form"
      />
      <Signup v-if="isTypeSignUp && doesGroupExist" />
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";

import authGroupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import {
  classifyURL,
  URL_TYPES,
  requiresSessionData,
  requiresAuthentication,
} from "@/services/urlClassifier.js";

import NoClassMessage from "@/components/NoClassMessage.vue";
import TokenAPI from "@/services/API/token";
import UserAPI from "@/services/API/user.js";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";

import useAssets from "@/assets/assets.js";

import Signin from "./Signin.vue";
import Signup from "./Signup.vue";
import LandingPage from "./LandingPage.vue";
import Error from "./Error.vue";

const assets = useAssets();

export default {
  name: "Home",
  components: {
    NoClassMessage,
    Signup,
    Signin,
    LandingPage,
    Error,
  },
  props: {
    /** The group the user falls under. Eg: HaryanaStudents, DelhiStudents */
    authGroup: {
      default: "HaryanaStudents",
      type: String,
    },

    /** ID of session */
    sessionId: {
      default: "",
      type: String,
    },

    /** for a quiz session, if omrmode is true */
    omrMode: {
      default: false,
      type: Boolean,
    },

    /** ab test id to indicate which abtest to perform */
    abTestId: {
      default: "",
      type: String,
    },

    /** What authentication action the user is doing. Eg: Sign-in or sign-up */
    type: {
      default: "sign-in",
      type: String,
    },

    /** What are the sign-in options the user must be displayed with. */
    auth_type: {
      default: "",
      type: String,
    },

    /** Whether the sign-up flow will be enabled for the user. */
    signup_form: {
      default: "false",
      type: String,
    },

    /** Whether any additional form is to be displayed to the user after authentication. */
    popup_form: {
      default: "false",
      type: String,
    },

    /** Whether an ID needs to be generated when the user signs up. */
    id_generation: {
      default: false,
      type: Boolean,
    },

    /** Whether the user should be redirected to an external platform after authentication. */
    redirection: {
      default: false,
      type: Boolean,
    },

    /** What the external platform is. */
    platform: {
      default: "",
      type: String,
    },

    /** What the external platform ID is. */
    platform_id: {
      default: "",
      type: String,
    },
    /** What the signup form ID is, if any. */
    signup_form_id: {
      default: "",
      type: String,
    },
    /** What the external platform link is. */
    platform_link: {
      default: "",
      type: String,
    },
    /** Test type from auth layer URL. */
    testType: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      authGroupData: null, // stores details about a group
      sessionData: null, // stores details about a session
      sessionEnabled: true, // whether a session is enabled
      isLoading: true,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      toast: useToast(),
      urlClassification: null, // URL type classification
    };
  },
  computed: {
    /**
     * Retrieves the authentication types.
     * @returns {string[]} An array of authentication types.
     */
    getAuthTypes() {
      return (
        (this.sessionData && this.sessionData.auth_type.split(",")) ||
        (this.auth_type && this.auth_type.split(",")) ||
        (this.authGroupData &&
          this.authGroupData.input_schema &&
          this.authGroupData.input_schema.auth_type.split(",")) ||
        []
      );
    },

    /** Returns if sign up flow should be enabled */
    isSignupEnabled() {
      return (
        (this.sessionData &&
          (this.sessionData.signup_form === true ||
            this.sessionData.signup_form === "true")) ||
        this.signup_form === "true"
      );
    },

    /** Returns if any additional form is to be displayed to the user after authentication. */
    isPopUpFormEnabled() {
      return (
        (this.sessionData &&
          (this.sessionData.popup_form === true ||
            this.sessionData.popup_form === "true")) ||
        this.popup_form === "true"
      );
    },

    /**
     * Checks if the authentication flow type is a sign-in.
     * @returns {boolean} True if the type is a sign-in, false otherwise.
     */
    isTypeSignIn() {
      return (
        (this.sessionData &&
          (this.sessionData.type == "sign-in" ||
            this.sessionData.type == "broadcast")) ||
        (!this.sessionData && this.type == "sign-in") || // gurukul
        this.type == "attendance" // report
      );
    },

    /**
     * Checks if the authentication flow type is a sign-up.
     * @returns {boolean} True if the type is a sign-up, false otherwise.
     */
    isTypeSignUp() {
      return (
        (this.sessionData && this.sessionData.type == "sign-up") ||
        this.type == "sign-up"
      );
    },

    /**
     * Checks if a group exists.
     * @returns {boolean} True if the group exists, false otherwise.
     */
    doesGroupExist() {
      return this.authGroupData;
    },

    /**
     * Retrieves the group.
     * @returns {string} The group.
     */
    getGroup() {
      if (this.sessionData && this.sessionData.group) {
        return this.sessionData.group;
      } else if (
        this.sessionData &&
        this.sessionData.meta_data &&
        this.sessionData.meta_data.group
      ) {
        return this.sessionData.meta_data.group;
      } else {
        return this.authGroup;
      }
    },

    /**
     * Classify the current URL type
     */
    getUrlClassification() {
      return classifyURL({
        sessionId: this.sessionId,
        platform: this.platform,
        platform_id: this.platform_id,
        platform_link: this.platform_link,
        type: this.type,
        authGroup: this.authGroup,
      });
    },

    /**
     * Checks if it is a landing page.
     * @returns {boolean} True if it is a landing page, false otherwise.
     * */
    isLandingPage() {
      return this.getUrlClassification.type === URL_TYPES.LANDING;
    },

    /**
     * Checks if URL requires session data loading
     */
    requiresSession() {
      return this.getUrlClassification.type === URL_TYPES.SESSION_BASED;
    },

    /**
     * Checks if URL has classification errors
     */
    hasUrlError() {
      return this.getUrlClassification.type === URL_TYPES.ERROR;
    },
  },
  methods: {
    setState() {
      this.isLoading = false;
    },

    /** Initialize store with session/URL parameters */
    initializeStore() {
      // ID generation
      this.$store.dispatch(
        "setIdGeneration",
        (this.sessionData && this.sessionData.id_generation == "true") ||
          this.id_generation == "true"
      );

      // OMR mode
      this.$store.dispatch("setOmrMode", this.omrMode);

      // AB test ID
      this.$store.dispatch("setAbTestId", this.abTestId);

      // Redirection settings
      this.$store.dispatch(
        "setRedirection",
        (this.sessionData && this.sessionData.redirection == "true") ||
          this.redirection == "true" ||
          this.platform == "report" ||
          this.platform == "gurukul"
      );

      // Platform details
      this.$store.dispatch(
        "setPlatform",
        (this.sessionData && this.sessionData.platform) || this.platform
      );

      this.$store.dispatch(
        "setPlatformId",
        (this.sessionData && this.sessionData.platform_id) || this.platform_id
      );

      this.$store.dispatch(
        "setSignupFormId",
        (this.sessionData && this.sessionData.signup_form_id) ||
          this.signup_form_id
      );

      this.$store.dispatch(
        "setPlatformLink",
        (this.sessionData && this.sessionData.platform_link) ||
          this.platform_link
      );

      // Auth group images
      this.$store.dispatch(
        "setImages",
        this.authGroupData &&
          this.authGroupData.input_schema &&
          this.authGroupData.input_schema.images
          ? this.authGroupData.input_schema.images.split(",")
          : []
      );
    },
  },
  async created() {
    // Classify URL type and handle accordingly
    this.urlClassification = this.getUrlClassification;

    // Handle URL classification errors early
    if (this.hasUrlError) {
      this.setState();
      return;
    }

    // Handle landing page - no API calls needed
    if (this.isLandingPage) {
      this.setState();
      return;
    }

    // Handle session-based URLs
    if (this.requiresSession) {
      this.sessionData = await sessionAPIService.getSessionData(this.sessionId);

      /** SessionId does not exist */
      if (Object.keys(this.sessionData).length == 0) {
        this.setState();
        this.$router.push({ name: "Error" });
        return;
      }

      /** Session API returns an error*/
      if (this.sessionData.error) {
        // Check if it's a 404 error (session not found) vs actual network error
        if (
          this.sessionData.error.response &&
          this.sessionData.error.response.status === 404
        ) {
          this.setState();
          this.$router.push({
            name: "Error",
            props: {
              text: "The session ID you provided does not exist. Please check the ID and try again.",
            },
          });
          return;
        } else {
          this.setState();
          this.$router.push({ name: "Error" });
          return;
        }
      } else {
        /** Store session data retrieved by API and set sessionEnabled */
        this.sessionData["sessionId"] = this.sessionId;
        this.$store.dispatch("setSessionData", this.sessionData);

        if ("is_session_open" in this.sessionData) {
          this.sessionEnabled = this.sessionData.is_session_open;

          // If session exists but is closed, show NoClassMessage instead of Error
          if (!this.sessionData.is_session_open) {
            this.setState();
            return;
          }
        }
      }

      /** If session is open, retrieve group data and store it */
      if (!this.sessionData.error) {
        if (this.sessionData.type == "broadcast") {
          // sessions without batches
          this.authGroupData = await authGroupAPIService.getAuthGroupData(
            this.sessionData.meta_data.group
          );
        } else {
          this.authGroupData = await authGroupAPIService.getAuthGroupName(
            this.sessionData.id
          );
        }
        this.$store.dispatch("setAuthGroupData", this.authGroupData);
        if (
          !this.sessionData.error &&
          this.authGroupData &&
          this.authGroupData.error
        ) {
          /** Group API returns an error*/
          this.setState();
          this.$router.push({ name: "Error" });
          return;
        }
      }
    } else {
      // Handle sessionless URLs - load group data directly
      this.authGroupData = await authGroupAPIService.getAuthGroupData(
        this.authGroup
      );

      this.$store.dispatch("setAuthGroupData", this.authGroupData);
      if (this.authGroupData && this.authGroupData.error) {
        /** Group API returns an error*/
        this.setState();
        this.$router.push({ name: "Error" });
        return;
      }
    }

    if (this.authGroupData && "input_schema" in this.authGroupData) {
      this.$store.dispatch(
        "setLocale",
        this.authGroupData.input_schema.default_locale
      );
    }

    // Initialize store with session/URL parameters
    this.initializeStore();

    let [token_verified, user_id] = await TokenAPI.checkForTokens(
      this.authGroupData ? this.authGroupData.name : "default"
    );
    if (token_verified && this.isTypeSignIn) {
      await sendSQSMessage(
        this.type,
        "", // deprecated sub_type
        this.$store.state.platform,
        this.$store.state.platform_id,
        user_id,
        this.auth_type.toString(),
        this.authGroupData ? this.authGroupData.name : "default",
        this.authGroupData && this.authGroupData.input_schema
          ? this.authGroupData.input_schema.userType
          : "student",
        this.sessionData && "session_id" in this.sessionData
          ? this.sessionData.session_id
          : "",
        this.sessionData &&
          "meta_data" in this.sessionData &&
          "batch" in this.sessionData.meta_data
          ? this.sessionData.meta_data.batch
          : "",
        "", //phone number
        "",
        "" // date of birth
      );

      if (this.sessionId != "") {
        // do not send logs to afdc for reports, gurukul
        await UserAPI.postUserSessionActivity(
          user_id,
          this.$store.state.sessionData.type,
          this.$store.state.sessionData.session_id,
          this.$store.state.authGroupData.input_schema.user_type,
          this.$store.state.sessionData.session_occurrence_id
        );
      }

      redirectToDestination(
        user_id,
        this.$store.state.omrMode,
        this.$store.state.abTestId,
        this.$store.state.platform_id,
        this.$store.state.platform_link,
        this.$store.state.platform,
        this.authGroupData && this.authGroupData.input_schema
          ? this.authGroupData.input_schema.userType
          : "student",
        this.sessionData &&
          this.sessionData.meta_data &&
          this.sessionData.meta_data.test_type,
        this.testType
      );
    } else {
      this.setState();
    }
  },
};
</script>
