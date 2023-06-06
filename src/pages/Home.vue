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
  <SignIn v-if="isSessionTypeSignIn && doesGroupExist" />
</template>

<script>
import Signup from "@/components/Signup.vue";
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import NoClassMessage from "@/components/NoClassMessage.vue";
import useAssets from "@/assets/assets.js";
import { useToast } from "vue-toastification";
import SignIn from "@/pages/Signin.vue";

const assets = useAssets();

export default {
  name: "Home",
  components: {
    NoClassMessage,
    Signup,
    SignIn,
  },
  props: {
    /** The resource we are redirecting to. Eg. redirectTo = plio tells us that we are redirecting to a plio. */
    redirectTo: {
      default: "",
      type: String,
    },

    /** ID of the resource. Eg. the plioID */
    redirectId: {
      default: "",
      type: String,
    },

    /** General category of why the data is being captured. Eg: attendance */
    purpose: {
      default: "",
      type: String,
    },

    /** Subcategory of the purpose. Eg: plio -> means the attendance is for a plio link */
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
    isSessionTypeSignIn() {
      return this.sessionData && this.sessionData.type == "sign-in";
    },

    /** Checks if group exists */
    doesGroupExist() {
      return this.groupData;
    },

    /** Retrieves destination platform */
    getRedirectTo() {
      return this.redirectTo == ""
        ? this.sessionData.redirectPlatform
        : this.redirectTo;
    },

    /** Retrieves destination ID */
    getRedirectId() {
      return this.redirectId == ""
        ? this.sessionData.redirectPlatformParams.id
        : this.redirectId;
    },

    /** Retrieves group name */
    getGroup() {
      return this.sessionId == null ? this.group : this.sessionData.group;
    },

    /** Returns the purpose value */
    getPurpose() {
      return this.purpose == "" ? this.sessionData.purpose : this.purpose;
    },

    /** Returns the purpose params  */
    getPurposeParams() {
      return this.purposeParams == ""
        ? this.sessionData.purposeParams
        : this.purposeParams;
    },
  },
  async created() {
    /** If sessionId exists in route, then retrieve session details. Otherwise, fallback to using group data. */
    if (this.sessionId != null) {
      this.sessionData = await sessionAPIService.getSessionData(this.sessionId);
      // Session ID does not exist
      if (Object.keys(this.sessionData).length == 0) {
        this.$router.push({
          name: "Error",
          params: {
            text: "There is no session scheduled with this ID. Please contact your Program Manager.",
          },
        });
      }

      // SessionAPI returns an error
      if (this.sessionData.error) {
        this.toast.error("Network Error, please try again!", {
          position: "top-center",
          timeout: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
      } else {
        this.toast.clear();
        this.$store.dispatch("setSessionData", this.sessionData);
        this.$store.dispatch("setSessionId", this.sessionId);
        if ("sessionActive" in this.sessionData) {
          this.sessionEnabled = this.sessionData.sessionActive;
        }
      }
      if (!this.sessionData.error && this.sessionEnabled)
        this.groupData = await groupAPIService.getGroupData(this.getGroup);
      this.$store.dispatch("setGroupData", this.groupData);
      if (!this.sessionData.error && this.groupData && this.groupData.error) {
        // GroupAPI returns an error
        this.toast.error("Network Error, please try again!", {
          position: "top-center",
          timeout: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
      }
    } else {
      this.groupData = await groupAPIService.getGroupData(this.getGroup);
      this.$store.dispatch("setGroupData", this.groupData);
      if (this.groupData && this.groupData.error) {
        // GroupAPI returns an error
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
