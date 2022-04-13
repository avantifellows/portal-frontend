<template>
<!-- NoClassMessage component -->
<div v-if="!sessionEnabled">
  <NoClassMessage/>
</div>
<div v-else>
  <!-- Entry component -->
  <div v-if="isAuthTypeID && doesGroupExist">
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
  <div v-else-if="isAuthTypeOTP && doesGroupExist">
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
  <div v-else-if="sessionData">
    <SessionEntry
      :sessionData="sessionData"
    />
  </div>
  </div>
</template>

<script>
import Entry from "@/components/Entry.vue";
import OTP from "@/components/OTP.vue";
import SessionEntry from "@/components/SessionEntry.vue";
import groupAPIService from "@/services/API/groupData.js";
import sessionAPIService from "@/services/API/sessionData.js";
import NoClassMessage from "@/components/NoClassMessage.vue";
export default {
  name: "Home",
  components: {
    Entry,
    OTP,
    SessionEntry,
    NoClassMessage
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
      default: null,
      type: String
    }
  },
  data() {
    return {
      groupData: null, // stores details about a group
      sessionData: null, // stores details about a session
      sessionEnabled: false // whether a session is enabled
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
    doesGroupExist(){
      return this.groupData;
    }
  },
  async created() {
    /** If sessionId exists in route, then retrieve session details. Otherwise, fallback is using group. */
    if(this.sessionId == null){
      this.groupData = await groupAPIService.getGroupData(this.group); }
    else{
     this.sessionData = await sessionAPIService.getSessionData(this.sessionId);
      this.sessionEnabled = (this.sessionData.enabled == "on") ? true : false;
    }
  },
};
</script>
