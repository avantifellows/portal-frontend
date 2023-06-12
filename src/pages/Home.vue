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
  <LandingPage v-if="isLandingPage" />
  <SignIn v-if="isSessionTypeSignIn && doesGroupExist" />
  <SignUp v-if="isSessionTypeSignUp && doesGroupExist" />
</template>

<script>
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import NoClassMessage from "@/components/NoClassMessage.vue";
import useAssets from "@/assets/assets.js";
import { useToast } from "vue-toastification";
import SignIn from "@/pages/Signin.vue";
import SignUp from "@/pages/Signup.vue";
import LandingPage from "./LandingPage.vue";

const assets = useAssets();

export default {
  name: "Home",
  components: {
    NoClassMessage,
    SignUp,
    SignIn,
    LandingPage,
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
    };
  },

  computed: {
    /**
     * Checks if the session type is a sign-in.
     * @returns {boolean} True if the session type is a sign-in, false otherwise.
     */
    isSessionTypeSignIn() {
      return this.sessionData && this.sessionData.type == "sign-in";
    },
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
      return this.redirectTo == ""
        ? this.sessionData.redirectPlatform
        : this.redirectTo;
    },

    /**
     * Retrieves the redirect ID.
     * @returns {string} The redirect ID.
     */
    getRedirectId() {
      return this.redirectId == ""
        ? this.sessionData.redirectPlatformParams.id
        : this.redirectId;
    },

    /**
     * Retrieves the group.
     * @returns {string} The group.
     */
    getGroup() {
      return this.sessionId == null ? this.group : this.sessionData.group;
    },

    /**
     * Retrieves the purpose.
     * @returns {string} The purpose.
     */
    getPurpose() {
      return this.purpose == "" ? this.sessionData.purpose : this.purpose;
    },

    /**
     * Retrieves the purpose parameters.
     * @returns {object} The purpose parameters.
     */
    getPurposeParams() {
      return this.purposeParams == ""
        ? this.sessionData.purposeParams
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
        this.$store.dispatch("setSessionData", this.sessionData);
        this.$store.dispatch("setSessionId", this.sessionId);
        if ("sessionActive" in this.sessionData) {
          this.sessionEnabled = this.sessionData.sessionActive;
        }
      }

      /** If session is open, retrieve group data and store it */
      if (!this.sessionData.error && this.sessionEnabled)
        this.groupData = await groupAPIService.getGroupData(this.getGroup);
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
