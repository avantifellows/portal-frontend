<template>
  <div>
    <SRNEntry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
    />
    <div class="mx-auto" v-if="!isSingleEntryOnly">
      <h3>OR</h3>
      <!-- student select component to be placed here -->
    </div>
  </div>
</template>

<script>
import SRNEntry from "@/components/SRNEntry.vue";

/* Have a variable isSingleEntryOnly that will help toggle between divs, one that will disable the entry of more 
than one SRN. Can be seen used also in SRNEntry.vue.
This is because the redirect link is one plio link and it takes a singular param of studentID. 
Maybe in the future could come up with a hack. For now, isSingleEntryOnly is set to true, hence only one SRN can be entered.
  Also, the dropdown feature is disabled for now. */

export default {
  name: "HomePage",
  components: {
    SRNEntry,
  },
  props: {
    redirectTo: {
      //the resource we are redirecting to. Eg. redirectTo=plio tells us that we are redirecting to a plio.
      default: "",
      type: String,
    },
    redirectID: {
      //ID of the resource. Eg. the plioID
      default: "",
      type: String,
    },
    purpose: {
      //general category of why the data is being captured. Eg: attendance
      default: "",
      type: String,
    },
    purposeParams: {
      //subcategory of the purpose. Eg: plio -> means the attendance is for a plio link
      default: "",
      type: String,
    },
  },
  computed: {
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
  },
};
</script>
