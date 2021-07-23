<template>
  <SRNEntry />
  <h3>OR</h3>
  <StudentSelect />
</template>

<script>
import StudentSelect from "../components/StudentSelect.vue";
import SRNEntry from "../components/SRNEntry.vue";

export default {
  name: "HomePage",
  components: {
    StudentSelect,
    SRNEntry,
  },
};
</script>
