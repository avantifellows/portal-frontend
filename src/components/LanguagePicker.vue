<template>
  <div class="flex justify-end px-6 py-4">
    <Dropdown
      label=""
      :options="['English', 'हिंदी']"
      :placeholder="placeholder"
      @update="updateLanguage"
    />
  </div>
</template>

<script>
import Dropdown from "@/components/Dropdown.vue";

export default {
  name: "LanguagePicker",
  components: { Dropdown },
  computed: {
    placeholder() {
      return this.$store.state.language == "en" ? "English" : "हिंदी";
    },
  },
  methods: {
    updateLanguage(e) {
      if (e == "English") {
        this.$store.dispatch("setLanguage", "en");
      } else {
        this.$store.dispatch("setLanguage", "hi");
      }
    },
  },
};
</script>
