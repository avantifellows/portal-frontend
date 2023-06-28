<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <div v-if="isPurposeRegistration">
    <Signup />
  </div>

  <div v-if="!sessionEnabled">
    <NoClassMessage />
  </div>

  <LandingPage v-if="isLandingPage" />
  <div v-if="!oldFlow">
    <NewSignIn v-if="isSessionTypeSignIn && doesGroupExist" />
    <NewSignUp v-if="isSessionTypeSignUp && doesGroupExist" />
  </div>
  <div v-else>
    <div
      v-if="
        !isLandingPage &&
        isAuthTypeID &&
        doesGroupExist &&
        !isSessionTypeSignIn &&
        !isSessionTypeSignUp
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
  </div>
</template>

<script>
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import NoClassMessage from "@/components/NoClassMessage.vue";
import useAssets from "@/assets/assets.js";
import { useToast } from "vue-toastification";
import NewSignIn from "./NewSignin.vue";
import NewSignUp from "./NewSignup.vue";
import LandingPage from "./LandingPage.vue";
import Entry from "@/components/Entry.vue";
import Signup from "@/components/Signup.vue";

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
    /** The resource we are redirecting to */
    redirectTo: {
      default: "",
      type: String,
    },

    /** ID of the resource */
    redirectId: {
      default: "",
      type: String,
    },

    /** General category of why the data is being captured. Eg: attendance */
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
      default: null,
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
      oldFlow: true,
    };
  },

  computed: {
    isPurposeRegistration() {
      return this.sessionData ? this.getPurpose == "registration" : false;
    },

    /** TEMP - Returns IP address of user */
    getUserIpAddress() {
      return this.sessionData ? this.sessionData.userIp : "";
    },

    /** TEMP - Whether authentication method chosen is an ID entry */
    isAuthTypeID() {
      return this.getAuthType.includes("ID");
    },

    /** TEMP - Returns how many authentication methods should be used */
    getLengthOfAuthType() {
      return this.getAuthType.split(",").length;
    },

    /** TEMP - Checks if the authentication methods mentioned are valid */
    areAuthTypesValid() {
      let validCount = 0;
      this.getAuthType.split(",").every((authType) => {
        validCount += validAuthTypes.includes(authType.toString()) ? 1 : 0;
        return validCount;
      });
      return validCount == this.getLengthOfAuthType;
    },

    /** TEMP - Apart from ID, are any extra inputs being validated. */
    isExtraInputValidationsRequired() {
      return this.getLengthOfAuthType > 1 && this.areAuthTypesValid;
    },

    /** TEMP - Returns the auth methods used by each group */
    getAuthType() {
      return this.groupData && this.groupData.authType ? this.groupData.authType : "ID";
    },
    /**
     * Checks if the session type is a sign-in.
     * @returns {boolean} True if the session type is a sign-in, false otherwise.
     */
    isSessionTypeSignIn() {
      return this.sessionData && this.sessionData.type == "sign-in";
    },

    /**
     * Checks if the session type is a sign-up.
     * @returns {boolean} True if the session type is a sign-up, false otherwise.
     */
    isSessionTypeSignUp() {
      return this.sessionData && this.sessionData.type == "sign-up";
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
      return this.group;
    },

    /**
     * Retrieves the purpose.
     * @returns {string} The purpose.
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
        this.sessionId == null
      );
    },
  },
  async created() {
    /**
     * If sessionId exists in route, then retrieve session details. Otherwise, fallback to using group data.
     */
    if (this.sessionId != null) {
      if (
        this.sessionId == "HaryanaStudents_10B37_45008_rxh-gkzc-kby" ||
        this.sessionId == "HaryanaStudents_10B19_45008_vaq-qthn-quv" ||
        this.sessionId == "HaryanaStudents_10B33_45008_vty-jdgr-gsr"
      ) {
        this.oldFlow = false;
        this.sessionData = await sessionAPIService.getSessionData(this.sessionId);
      } else {
        this.sessionData = await sessionAPIService.getOldSessionData(this.sessionId);
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
        this.$store.dispatch("setSessionData", this.sessionData);
        this.$store.dispatch("setSessionId", this.sessionId);
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
          this.groupData = await groupAPIService.getGroupName(this.sessionData.id);
        } else {
          this.groupData = await groupAPIService.getGroupData(this.sessionData.group);
        }
        //this.groupData = await groupAPIService.getGroupData(groupName);
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
      /**
       * If sessionId does not exist in route, then retrieve group data directly
       */
      this.groupData = await groupAPIService.getGroupData(this.getGroup);
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
  },
};
</script>
