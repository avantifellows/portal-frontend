<template>
  <div>
    <SRNEntry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :subPurpose="subPurpose"
      :plioUse="plioUse"
    />
    <div class="mx-auto" v-if="!plioUse">
      <h3>OR</h3>
      <StudentSelect />
    </div>
  </div>
</template>

<script>
import StudentSelect from "@/components/StudentSelect.vue";
import SRNEntry from "@/components/SRNEntry.vue";

/* Have a variable plioUse that will help toggle between divs, one that will disable the entry of more 
than one SRN. Can be seen used also in SRNEntry.vue.
This is because the redirect link is one plio link and it takes a singular param of studentID. 
Maybe in the future could come up with a hack. For now, plioUse is set to true, hence only one SRN can be entered.
  Also, the dropdown feature is disabled for now. */

export default {
  name: "HomePage",
  components: {
    StudentSelect,
    SRNEntry,
  },

  /*these are props expected by this app. 
  RedirectTo tells what is the resource we are redirecting to. Eg. redirectTo=plio tells us that we are redirecting to a plio. 
  The plio link is built later on after the student submits their SRN.
  RedirectID contains the ID of the resource. Eg. the plioID
  Purpose is the general category of why the data is being captured. Eg: attendance
  SubPurpose describes the subcategory of the purpose. Eg: plio -> means the attendance is for a plio link
*/

  props: {
    redirectTo: {
      default: "",
      type: String,
    },
    redirectID: {
      default: "",
      type: String,
    },
    purpose: {
      default: "",
      type: String,
    },
    subPurpose: {
      default: "",
      type: String,
    },
  },
  data() {
    return {
      plioUse: false,
    };
  },
};
</script>
