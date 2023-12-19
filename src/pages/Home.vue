<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div v-if="!sessionEnabled">
    <NoClassMessage />
  </div>

  <div v-if="isLandingPage" class="flex h-screen flex-col">
    <LandingPage />
  </div>

  <div v-else>
    <div v-if="!oldFlow">
      <LanguagePicker :options="getLanguages" />
      <NewSignIn
        v-if="isTypeSignIn && doesGroupExist"
        :sub_type="getSubType"
        :auth_type="getAuthTypes"
        :enable_signup="isSignupEnabled"
        :enable_pop_up_form="isPopUpFormEnabled"
        :locale="getLocale"
      />
      <NewSignUp
        v-if="isTypeSignUp && doesGroupExist"
        :locale="getLocale"
        :images="getGroupImages"
      />
    </div>

    <div v-else>
      <div
        v-if="
          !isPurposeRegistration &&
          !isLandingPage &&
          isAuthTypeID &&
          doesGroupExist
        "
      >
        <Entry
          :redirectTo="getRedirectTo"
          :redirectId="getRedirectId"
          :purpose="getPurpose"
          :purposeParams="getPurposeParams"
          :groupData="groupData"
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

import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";

import NoClassMessage from "@/components/NoClassMessage.vue";
import Entry from "@/components/Entry.vue";
import Signup from "@/components/Signup.vue";
import LanguagePicker from "@/components/LanguagePicker.vue";

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
    LanguagePicker,
  },
  props: {
    /** The resource we are redirecting to.
     * (WILL BE DEPRECATED IN V2)
     */
    redirectTo: {
      default: "",
      type: String,
    },

    /** ID of the resource.
     * (WILL BE DEPRECATED IN V2)
     */
    redirectId: {
      default: "",
      type: String,
    },

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
    group: {
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
    enable_signup: {
      default: false,
      type: Boolean,
    },

    /** Whether any additional form is to be displayed to the user after authentication. */
    enable_pop_up_form: {
      default: false,
      type: Boolean,
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
  },
  data() {
    return {
      groupData: null, // stores details about a group
      sessionData: null, // stores details about a session
      sessionEnabled: true, // whether a session is enabled
      isLoading: true,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      toast: useToast(),
      oldFlow: true, // oldFlow refers to user using V1
    };
  },
  computed: {
    /** Returns list of available language options. */
    getLanguages() {
      return this.groupData && "languages" in this.groupData.input_schema
        ? this.groupData.input_schema.languages
        : ["English"];
    },

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.language;
    },

    /**
     * Retrieves the group images.
     * @returns {string[]} An array of group images.
     */
    getGroupImages() {
      this.$store.dispatch("setImages", this.groupData.input_schema.images);
    },

    /** Returns if the purpose is registration.
     *  (THIS METHOD WILL BE DEPRECATED IN V2)
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
      return this.groupData && this.groupData.authType
        ? this.groupData.authType
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
        (this.groupData && this.groupData.input_schema.auth_type.split(","))
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
        (this.sessionData && this.sessionData.activate_signup == "True") ||
        this.enable_signup == "True"
      );
    },

    /** Returns if any additional form is to be displayed to the user after authentication. */
    isPopUpFormEnabled() {
      console.log(
        this.sessionData && this.sessionData.enable_pop_up_form == "True"
      );
      return (
        (this.sessionData && this.sessionData.pop_up_form == "True") ||
        this.enable_pop_up_form == "True"
      );
    },

    /** Returns if ID should be generated for a user after sign up. */
    isIdGenerationEnabled() {
      this.$store.dispatch(
        "setIdGeneration",
        (this.sessionData && this.sessionData.id_generation == "True") ||
          this.id_generation == "True"
      );
    },

    /** Returns if user should be redirected to external platform after authentication. */
    isRedirectionEnabled() {
      this.$store.dispatch(
        "setRedirection",
        (this.sessionData && this.sessionData.redirection == "True") ||
          this.redirection == "True"
      );
    },

    /** Returns the external platform the user should be redirected to. */
    getPlatform() {
      this.$store.dispatch(
        "setPlatform",
        (this.sessionData && this.sessionData.platform) || this.platform
      );
    },

    /** Returns the external platform ID the user should be redirected to. */
    getPlatformId() {
      this.$store.dispatch(
        "setPlatformId",
        (this.sessionData && this.sessionData.platform_id) || this.platform_id
      );
    },

    /**
     * Checks if the authentication flow type is a sign-in.
     * @returns {boolean} True if the type is a sign-in, false otherwise.
     */
    isTypeSignIn() {
      return (
        (this.sessionData && this.sessionData.type == "sign-in") ||
        this.type == "sign-in" ||
        this.purpose == "attendance"
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
      return this.groupData;
    },

    /**
     * Retrieves the redirect destination.
     * @returns {string} The redirect destination.
     * (THIS METHOD WILL BE DEPRECATED IN V2. Will be replaced with getPlatform)
     */
    getRedirectTo() {
      return this.redirectTo == "" && this.sessionData != null
        ? this.oldFlow
          ? this.sessionData.redirectPlatform
          : this.sessionData.platform
        : this.redirectTo;
    },

    /**
     * Retrieves the redirect ID.
     * @returns {string} The redirect ID.
     * (THIS METHOD WILL BE DEPRECATED IN V2. Will be replaced with getPlatformId)
     */
    getRedirectId() {
      return this.redirectId == "" && this.sessionData != null
        ? this.oldFlow
          ? this.sessionData.redirectPlatformParams.id
          : this.sessionData.platform_id
        : this.redirectId;
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
        this.purpose == "" &&
        this.purposeParams == "" &&
        this.redirectId == "" &&
        this.redirectTo == "" &&
        this.platform == "" &&
        this.platform_id == "" &&
        this.sub_type == "" &&
        this.sessionId == ""
      );
    },
  },
  async created() {
    this.$store.dispatch("setLanguage", "en");
    /**
     * If sessionId exists in route, then retrieve session details. Otherwise, fallback to using group data.
     */
    if (this.sessionId != "") {
      if (this.sessionId.startsWith("HaryanaStudents")) {
        this.oldFlow = false;
        this.sessionData = await sessionAPIService.getSessionData(
          this.sessionId
        );
      } else {
        this.sessionData = await sessionAPIService.getOldSessionData(
          this.sessionId
        );
      }

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
      if (!this.sessionData.error && this.sessionEnabled) {
        if (!this.oldFlow) {
          this.groupData = await groupAPIService.getGroupName(
            this.sessionData.id
          );
        } else {
          this.groupData = await groupAPIService.getGroupData(
            this.sessionData.group
          );
        }
        this.$store.dispatch("setGroupData", this.groupData);
        if (!this.sessionData.error && this.groupData && this.groupData.error) {
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
      if (this.platform == "gurukul") {
        this.oldFlow = false;
      }
      /**
       * If sessionId does not exist in route, then retrieve group data directly
       */
      if (!this.oldFlow) {
        this.groupData = await groupAPIService.getNewGroupData(this.group);
      } else {
        this.groupData = await groupAPIService.getGroupData(this.getGroup);
      }
      this.$store.dispatch("setGroupData", this.groupData);
      if (this.groupData && this.groupData.error) {
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
    this.getPlatform;
    this.getPlatformId;
    this.getGroupImages;
  },
};
</script>
