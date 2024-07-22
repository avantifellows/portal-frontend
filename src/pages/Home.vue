<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div v-if="isLandingPage" class="flex h-screen flex-col">
    <LandingPage />
  </div>

  <div v-if="!sessionEnabled">
    <NoClassMessage />
  </div>

  <div v-else>
    <div v-if="!oldFlow">
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

    <div v-else>
      <div
        v-if="!isPurposeRegistration && !isLandingPage && isAuthTypeID && doesGroupExist"
      >
        <Entry
          :redirectTo="getRedirectTo"
          :redirectId="getRedirectId"
          :purpose="getPurpose"
          :purposeParams="getPurposeParams"
          :groupData="authGroupData"
          :group="getGroup"
          :authType="getAuthType"
          :sessionId="sessionId"
          :userIpAddress="getUserIpAddress"
          :isExtraInputValidationRequired="isExtraInputValidationsRequired"
        />
      </div>

      <div v-if="isPurposeRegistration && !isTypeSignIn && !isTypeSignUp">
        <Signup />
      </div>
    </div>
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
import TokenAPI from "@/services/API/token";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";

import useAssets from "@/assets/assets.js";

import NewSignIn from "./NewSignin.vue";
import NewSignUp from "./NewSignup.vue";
import LandingPage from "./LandingPage.vue";

const validAuthTypes = ["DOB", "ID", "PH"];
const assets = useAssets();

export default {
  name: "Home",
  components: {
    NoClassMessage,
    NewSignUp,
    NewSignIn,
    LandingPage,
    Entry,
    Signup,
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
      oldFlow: false, // oldFlow refers to user using V1
    };
  },
  computed: {
    /** Returns if the purpose is registration.
     * (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    isPurposeRegistration() {
      return this.sessionData ? this.getPurpose == "registration" : false;
    },

    /** Returns IP address of user.
     *  (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    getUserIpAddress() {
      return this.sessionData ? this.sessionData.userIp : "";
    },

    /** Whether authentication method chosen is an ID entry.
     *  (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    isAuthTypeID() {
      return this.getAuthType.includes("ID");
    },

    /** Returns how many authentication methods should be used.
     * (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    getLengthOfAuthType() {
      return this.getAuthType.split(",").length;
    },

    /** Checks if the authentication methods mentioned are valid.
     * (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    areAuthTypesValid() {
      let validCount = 0;
      this.getAuthType.split(",").every((authType) => {
        validCount += validAuthTypes.includes(authType.toString()) ? 1 : 0;
        return validCount;
      });
      return validCount == this.getLengthOfAuthType;
    },

    /** Apart from ID, are any extra inputs being validated.
     * (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    isExtraInputValidationsRequired() {
      return this.getLengthOfAuthType > 1 && this.areAuthTypesValid;
    },

    /** Returns the auth methods used by each group.
     * (THIS METHOD WILL BE DEPRECATED IN V2)
     */
    getAuthType() {
      return this.authGroupData && this.authGroupData.authType
        ? this.authGroupData.authType
        : "ID";
    },

    /**
     * Retrieves the authentication types.
     * @returns {string[]} An array of authentication types.
     */
    getAuthTypes() {
      return (
        (this.sessionData && this.sessionData.auth_type.split(",")) ||
        (this.auth_type && this.auth_type.split(",")) ||
        (this.authGroupData && this.authGroupData.input_schema.auth_type.split(","))
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
          this.redirection == "true" || this.platform == "report" || this.platform == "gurukul"
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
        (this.sessionData && (this.sessionData.type == "sign-in" || this.sessionData.type == "broadcast")) ||
        (!this.sessionData && this.type == "sign-in" && this.oldFlow == false) || // gurukul
        this.purpose == "attendance" || this.type == "attendance" // report
      );
    },

    /**
     * Checks if the authentication flow type is a sign-up.
     * @returns {boolean} True if the type is a sign-up, false otherwise.
     */
    isTypeSignUp() {
      return (
        (this.sessionData && this.sessionData.type == "sign-up") || this.type == "sign-up"
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
     * Retrieves the redirect destination.
     * @returns {string} The redirect destination.
     * (THIS METHOD WILL BE DEPRECATED IN V2. Will be replaced with getPlatform)
     */
    getRedirectTo() {
      return this.platform == "" && this.sessionData != null
        ? this.oldFlow
          ? this.sessionData.redirectPlatform
          : this.sessionData.platform
        : this.platform;
    },

    /**
     * Retrieves the redirect ID.
     * @returns {string} The redirect ID.
     * (THIS METHOD WILL BE DEPRECATED IN V2. Will be replaced with getPlatformId)
     */
    getRedirectId() {
      return this.platform_id == "" && this.sessionData != null
        ? this.oldFlow
          ? this.sessionData.redirectPlatformParams.id
          : this.sessionData.platform_id
        : this.platform_id;
    },

    /**
     * Retrieves the group.
     * @returns {string} The group.
     */
    getGroup() {
      if (this.sessionData && this.sessionData.group) {
        return this.sessionData.group;
      }
      else if (this.sessionData && this.sessionData.meta_data && this.sessionData.meta_data.group) {
        return this.sessionData.meta_data.group;
      }
      else {
        return this.authGroup;
      }
    },

    /**
     * Retrieves the purpose.
     * @returns {string} The purpose.
     * (THIS METHOD WILL BE DEPRECATED IN V2. Will be replaced with type.)
     */
    getPurpose() {
      return this.purpose == "" && this.sessionData != null
        ? this.sessionData.purpose
        : this.purpose;
    },

    /**
     * Retrieves the purpose parameters.
     * @returns {object} The purpose parameters.
     */
    getPurposeParams() {
      return this.purposeParams == "" && this.sessionData != null
        ? this.oldFlow
          ? this.sessionData.purposeParams
          : this.sessionData.purpose["sub_type"]
        : this.purposeParams;
    },

    /**
     * Checks if it is a landing page.
     * @returns {boolean} True if it is a landing page, false otherwise.
     * */
    isLandingPage() {
      return (
        this.platform_id == "" &&
        this.platform == "" &&
        this.sub_type == "" &&
        this.sessionId == "" &&
        this.platform_link == ""
      );
    },
    setAuthGroupImages() {
      this.$store.dispatch(
        "setImages",
        this.oldFlow
          ? this.authGroupData.images[0]
          : this.authGroupData && this.authGroupData.input_schema.images.split(",")
      );
    },
  },
  async created() {
    // if (this.platform == "report") {
    //   this.oldFlow = true;
    // }

    /**
     * If sessionId exists in route, then retrieve session details. Otherwise, fallback to using group data.
     */
    if (this.sessionId != "") {
      if (this.sessionId.startsWith("PunjabStudents") || this.sessionId.startsWith("CD_Hiring") || this.sessionId.startsWith("AFTesting")) {
        this.oldFlow = true;
        this.sessionData = await sessionAPIService.getOldSessionData(this.sessionId);
      } else {
        this.sessionData = await sessionAPIService.getSessionData(this.sessionId);
      }

      /** SessionId does not exist */
      if (Object.keys(this.sessionData).length == 0) {
        this.$router.push({
          name: "Error",
          params: {
            text:
              "There is no session scheduled with this ID. Please contact your Program Manager.",
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

        if (this.oldFlow) {
          if ("sessionActive" in this.sessionData) {
            this.sessionEnabled = this.sessionData.sessionActive;
          }
        } else {
          if ("is_session_open" in this.sessionData) {
            this.sessionEnabled = this.sessionData.is_session_open;
          }
        }
      }

      /** If session is open, retrieve group data and store it */
      if (!this.sessionData.error) {
        if (!this.oldFlow) {
          if (this.sessionData.type == "broadcast") {
            this.authGroupData = await authGroupAPIService.getAuthGroupData(this.sessionData.meta_data.group);
          }
          else {
            this.authGroupData = await authGroupAPIService.getAuthGroupName(this.sessionData.id);
          }
        } else {
          this.authGroupData = await authGroupAPIService.getGroupData(
            this.sessionData.group
          );
        }
        this.$store.dispatch("setAuthGroupData", this.authGroupData);
        if (!this.sessionData.error && this.authGroupData && this.authGroupData.error) {
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
    } else {
      /**
       * If sessionId does not exist in route, then retrieve group data directly
       */
      if (!this.oldFlow) {
        // this is wrong
        this.authGroupData = await authGroupAPIService.getAuthGroupData(this.authGroup);
      } else {
        this.authGroupData = await authGroupAPIService.getGroupData(this.getGroup);
      }

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

    let [token_verified, user_id] = await TokenAPI.checkForTokens(this.authGroup);
    if (token_verified) {
      if (
        redirectToDestination(
          this.sub_type,
          user_id,
          this.$store.state.platform_id,
          this.$store.state.platform_link,
          this.$store.state.platform,
          this.$store.state.authGroupData.input_schema.userType
        )
      ) {
        sendSQSMessage(
          this.type,
          this.sub_type,
          this.$store.state.platform,
          this.$store.state.platform_id,
          user_id,
          this.auth_type.toString(),
          this.$store.state.authGroupData.name,
          this.$store.state.authGroupData.input_schema.userType,
          "sessionData" in this.$store.state &&
            "session_id" in this.$store.state.sessionData
            ? this.$store.state.sessionData.session_id
            : "",
          "sessionData" in this.$store.state &&
            "meta_data" in this.$store.state.sessionData &&
            "batch" in this.$store.state.sessionData.meta_data
            ? this.$store.state.sessionData.meta_data.batch
            : "",
          "", //phone number
          "",
          "" // date of birth
        );
      }
    } else {
      if ("input_schema" in this.authGroupData) {
      this.$store.dispatch("setLocale", this.authGroupData.input_schema.default_locale);
      }

      this.isIdGenerationEnabled;
      this.isRedirectionEnabled;
      this.setPlatform;
      this.setPlatformId;
      this.setPlatformLink;
      this.setAuthGroupImages;
      this.isLoading = false;
    }
  },
};
</script>
