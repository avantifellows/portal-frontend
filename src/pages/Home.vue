<template>
  <!-- Entry component -->
  <div v-if="isAuthTypeID && groupData">
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
  <div v-else-if="isAuthTypeOTP && groupData">
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
</template>

<script>
import Entry from "@/components/Entry.vue";
import OTP from "@/components/OTP.vue";
import groupAPIService from "@/services/API/groupData.js";

export default {
  name: "Home",
  components: {
    Entry,
    OTP,
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
  },
  data() {
    return {
      groupData: null,
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
    /** Group name is sent to the API to retrieve all details */
    this.groupData = await groupAPIService.getGroupData(this.group);
  },
};
</script>
