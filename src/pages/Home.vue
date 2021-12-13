<template>
  <div>
    <SRNEntry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
    />
  </div>
</template>

<script>
import SRNEntry from "@/components/SRNEntry.vue";

export default {
  name: "Home",
  components: {
    SRNEntry,
  },
  props: {
    redirectTo: {
      /** The resource we are redirecting to. Eg. redirectTo = plio tells us that we are redirecting to a plio. */
      default: "",
      type: String,
    },
    redirectID: {
      /** ID of the resource. Eg. the plioID */
      default: "",
      type: String,
    },
    purpose: {
      /** General category of why the data is being captured. Eg: attendance */
      default: "",
      type: String,
    },
    purposeParams: {
      /** Subcategory of the purpose. Eg: plio -> means the attendance is for a plio link */
      default: "",
      type: String,
    },
  },
  computed: {
    isMultipleIDEntryAllowedEntryOnly() {
      return this.redirectTo == "plio";
    },
  },
};
</script>
