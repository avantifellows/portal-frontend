<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <NoClassMessage v-if="!sessionEnabled" />

  <div v-if="isLandingPage" class="flex h-screen flex-col">
    <LandingPage />
  </div>

  <div v-else>
    <LocalePicker :options="getLocale" />
    <NewSignIn
      v-if="isTypeSignIn && doesGroupExist"
      :sub_type="getSubType"
      :is_type_signin="isTypeSignIn"
      :auth_type="getAuthTypes"
      :enable_signup="isSignupEnabled"
      :enable_popup="isPopUpFormEnabled"
    />
    <NewSignUp v-if="isTypeSignUp && doesGroupExist" />
  </div>
</template>

<script>
import { useToast } from "vue-toastification";

import authGroupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";

import NoClassMessage from "@/components/NoClassMessage.vue";
import Entry from "@/components/Entry.vue";
import Signup from "@/components/Signup.vue";
import LocalePicker from "@/components/LocalePicker.vue";

import useAssets from "@/assets/assets.js";

import NewSignIn from "./NewSignin.vue";
import NewSignUp from "./NewSignup.vue";
import LandingPage from "./LandingPage.vue";

const validAuthTypes = ["DOB", "ID", "PH"];
const assets = useAssets();

export default {
  name: "NewHome",
  components: {
    NoClassMessage,
    NewSignUp,
    NewSignIn,
    LandingPage,
    Entry,
    Signup,
    LocalePicker,
  },
  props: {
    /** General category of why the data is being captured. Eg: attendance
     * (WILL BE DEPRECATED IN V2)
     */
    purpose: {
      default: "",
      type: String,
    },

    /** Subcategory of the purpose. Eg: meet -> means the attendance is for a meet link */
    purposeParams: {
      default: "",
      type: String,
    },

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

    /** What authentication action the user is doing. Eg: Sign-in or sign-up */
    type: {
      default: "sign-in",
      type: String,
    },

    /** Which module is being used */
    sub_type: {
      default: "",
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
    /** What the external platform link is. */
    platform_link: {
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
    };
  },
  computed: {
    getLocale() {
      return this.authGroupData
        ? this.authGroupData.locale.split(",")
        : ["English"];
    },

    /**
     * Retrieves the authentication types.
     * @returns {string[]} An array of authentication types.
     */
    getAuthTypes() {
      return (
        (this.sessionData && this.sessionData.auth_type.split(",")) ||
        (this.auth_type && this.auth_type.split(",")) ||
        (this.authGroupData &&
          this.authGroupData.input_schema.auth_type.split(","))
      );
    },

    getSubType() {
      return (
        this.purposeParams ||
        this.sub_type ||
        (this.sessionData ? this.sessionData.purpose["sub-type"] : "")
      );
    },

    /** Returns if sign up flow should be enabled */
    isSignupEnabled() {
      return (
        (this.sessionData && this.sessionData.signup_form == "True") ||
        this.signup_form == "true"
      );
    },

    /** Returns if any additional form is to be displayed to the user after authentication. */
    isPopUpFormEnabled() {
      return (
        (this.sessionData && this.sessionData.popup_form == "True") ||
        this.popup_form == "true"
      );
    },

    /** Stores if ID should be generated for a user after sign up in the store. */
    isIdGenerationEnabled() {
      this.$store.dispatch(
        "setIdGeneration",
        (this.sessionData && this.sessionData.id_generation == "True") ||
          this.id_generation == "true"
      );
    },

    /** Stores if user should be redirected to external platform after authentication in the store. */
    isRedirectionEnabled() {
      this.$store.dispatch(
        "setRedirection",
        (this.sessionData && this.sessionData.redirection == "True") ||
          this.redirection == "true"
      );
    },

    /** Stores the external platform the user should be redirected to in the store. */
    setPlatform() {
      this.$store.dispatch(
        "setPlatform",
        (this.sessionData && this.sessionData.platform) || this.platform
      );
    },

    /** Returns the external platform ID the user should be redirected to. */
    setPlatformId() {
      this.$store.dispatch(
        "setPlatformId",
        (this.sessionData && this.sessionData.platform_id) || this.platform_id
      );
    },

    /** Returns the external platform link the user should be redirected to. */
    setPlatformLink() {
      this.$store.dispatch(
        "setPlatformLink",
        (this.sessionData && this.sessionData.platform_link) || this.platform_link
      );
    },

    /**
     * Checks if the authentication flow type is a sign-in.
     * @returns {boolean} True if the type is a sign-in, false otherwise.
     */
    isTypeSignIn() {
      return (
        (this.sessionData && this.sessionData.type == "sign-in") ||
        this.type == "sign-in"
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
      return this.sessionData && this.sessionData.group
        ? this.sessionData.group
        : this.group;
    },

    /**
     * Retrieves the purpose parameters.
     * @returns {object} The purpose parameters.
     */
    getPurposeParams() {
      return this.purposeParams == "" && this.sessionData != null
        ? this.sessionData.purposeParams
        : this.sessionData.purpose["sub_type"];
    },

    /**
     * Checks if it is a landing page.
     * @returns {boolean} True if it is a landing page, false otherwise.
     * */
    isLandingPage() {
      return (
        this.purpose == "" &&
        this.purposeParams == "" &&
        this.platform == "" &&
        this.platform_id == "" &&
        this.sub_type == "" &&
        this.sessionId == "" &&
        this.platform_link == ""
      );
    },
    setAuthGroupImages() {
      this.$store.dispatch(
        "setImages",
        this.authGroupData && this.authGroupData.input_schema.images.split(",")
      );
    },
  },
  async created() {
    this.$store.dispatch("setLocale", "en");
    /**
     * If sessionId exists in route, then retrieve session details. Otherwise, fallback to using group data.
     */
    if (this.sessionId != "") {
      this.sessionData = await sessionAPIService.getSessionData(this.sessionId);

      /** SessionId does not exist */
      if (Object.keys(this.sessionData).length == 0) {
        this.$router.push({
          name: "Error",
          params: {
            text: "There is no session scheduled with this ID. Please contact your Program Manager.",
          },
        });
      }

      /** Session API returns an error*/
      if (this.sessionData.error) {
        this.toast.error("Network Error, please try again!", {
          position: "top-center",
          timeout: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
      } else {
        /** Store session data retrieved by API and set sessionEnabled */
        this.toast.clear();
        this.sessionData["sessionId"] = this.sessionId;
        this.$store.dispatch("setSessionData", this.sessionData);

        if ("is_session_open" in this.sessionData) {
          this.sessionEnabled = this.sessionData.is_session_open;
        }
      }

      /** If session is open, retrieve group data and store it */
      if (!this.sessionData.error && this.sessionEnabled) {
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
        this.toast.error("Network Error, please try again!", {
          position: "top-center",
          timeout: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
      }
    } else {
      /**
       * If sessionId does not exist in route, then retrieve group data directly
       */
      this.authGroupData = await authGroupAPIService.getAuthGroupData(
        this.authGroup
      );
      this.$store.dispatch("setAuthGroupData", this.authGroupData);
      if (this.authGroupData && this.authGroupData.error) {
        /** Group API returns an error*/
        this.toast.error("Network Error, please try again!", {
          position: "top-center",
          timeout: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
      }
    }

    this.isLoading = false;
    this.isIdGenerationEnabled;
    this.isRedirectionEnabled;
    this.setPlatform;
    this.setPlatformId;
    this.setPlatformLink;
    this.setAuthGroupImages;
  },
};
</script>
