<template>
  <div v-if="isLoading">
    <div class="flex m-auto h-screen w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <div v-else>
    <!-- NoClassMessage component -->
    <div v-if="!sessionEnabled">
      <NoClassMessage />
    </div>
    <div v-else>
      <!-- Entry component -->
      <div v-if="isAuthTypeID && doesGroupExist">
        <Entry
          :redirectTo="getRedirectTo"
          :redirectId="getRedirectId"
          :purpose="getPurpose"
          :purposeParams="getPurposeParams"
          :groupData="groupData"
          :group="getGroup"
          :authType="authType"
          :sessionId="sessionId"
        />
      </div>
      <!-- OTP component -->
      <div v-else-if="isAuthTypeOTP && doesGroupExist">
        <OTP
          :redirectTo="redirectTo"
          :redirectId="redirectId"
          :purpose="purpose"
          :purposeParams="purposeParams"
          :groupData="groupData"
          :group="getGroup"
          :authType="authType"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Entry from "@/components/Entry.vue";
import OTP from "@/components/OTP.vue";
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import NoClassMessage from "@/components/NoClassMessage.vue";
import useAssets from "@/assets/assets.js";

const assets = useAssets();
export default {
  name: "Home",
  components: {
    Entry,
    OTP,
    NoClassMessage,
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
    /** The authentication method used by the user */
    authType: {
      default: "ID",
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
      sessionEnabled: false, // whether a session is enabled
      isLoading: true,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
    };
  },
  computed: {
    /** Whether authentication method chosen is an ID entry */
    isAuthTypeID() {
      return this.authType == "ID";
    },

    /** Whether authentication method chosen is OTP */
    isAuthTypeOTP() {
      return this.authType == "OTP";
    },

    /** Checks if group exists */
    doesGroupExist() {
      return this.groupData;
    },

    /** Retrieves destination platform */
    getRedirectTo() {
      return this.redirectTo == "" ? this.sessionData.redirectPlatform : this.redirectTo;
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
          params: { text: "Please check Session ID" },
        });
      }
      this.sessionEnabled = this.sessionData.sessionActive;
    }

    if (this.sessionEnabled)
      this.groupData = await groupAPIService.getGroupData(this.getGroup);
    this.isLoading = false;
  },
};
</script>
