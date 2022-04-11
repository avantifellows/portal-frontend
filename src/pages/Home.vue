<template>
<!-- UserMessage component -->
<div v-if="!sessionEnabled">
  <UserMessage/>
</div>
  <!-- Entry component -->
  <div v-if="isAuthTypeID && groupData && sessionEnabled">
    <Entry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :groupData="groupData"
      :group="group"
      :authType="authType"
    />
  </div>
  <!-- OTP component -->
  <div v-else-if="isAuthTypeOTP && groupData && sessionEnabled">
    <OTP
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :groupData="groupData"
      :group="group"
      :authType="authType"
    />
  </div>
  <!-- Session component -->
  <div v-else-if="sessionData && sessionEnabled">
    <SessionEntry
      :sessionData="sessionData"
    />
  </div>
</template>

<script>
import Entry from "@/components/Entry.vue";
import OTP from "@/components/OTP.vue";
import SessionEntry from "@/components/SessionEntry.vue";
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import UserMessage from "@/components/UserMessage.vue";
export default {
  name: "Home",
  components: {
    Entry,
    OTP,
    SessionEntry,
    UserMessage
  },
  props: {
    /** The resource we are redirecting to. Eg. redirectTo = plio tells us that we are redirecting to a plio. */
    redirectTo: {
      default: "",
      type: String,
    },
    /** ID of the resource. Eg. the plioID */
    redirectID: {
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
      default: "",
      type: String
    }
  },
  data() {
    return {
      groupData: null, // stores details about a group
      sessionData: null, // stores details about a session
      sessionEnabled: true // whether a session is enabled
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
  },
  async created() {
    /** If sessionId exists in route, then retrieve session details. Otherwise, fallback is using group. */
    if(this.sessionId === ""){
      this.groupData = await groupAPIService.getGroupData(this.group); }
    else{
     this.sessionData = await sessionAPIService.getSessionData(this.sessionId);
      (this.sessionData.enabled == "on") ? this.sessionEnabled = true : this.sessionEnabled = false;
    }
  },
};
</script>
