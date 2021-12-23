<template>
  <!-- Entry component -->
  <div v-if="isAuthTypeID && programData">
    <Entry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :programData="programData"
      :program="program"
      :authType="authType"
    />
  </div>
  <div v-else-if="isAuthTypeOTP">
    <OTP
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :programData="programData"
      :program="program"
      :authType="authType"
    />
  </div>
</template>

<script>
import Entry from "@/components/Entry.vue";
import OTP from "@/components/OTP.vue";
import programAPIService from "@/services/API/programData.js";

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
    /** The program the user falls under. Eg: HaryanaStudents, DelhiStudents */
    program: {
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
      programData: null,
    };
  },
  computed: {
    /** Whether multiple ID can be entered */
    isMultipleIDEntryAllowed() {
      return this.redirectTo == "plio";
    },
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
    /** Program name is sent to the API to retrieve all details */
    this.programData = await programAPIService.getProgramData(this.program);
  },
};
</script>
