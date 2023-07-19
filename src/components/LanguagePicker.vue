<template>
  <div class="mt-6 flex justify-center">
    <Dropdown
      label="Select your language"
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
      return this.$store.state.language == "en" ? "English" : "Hindi";
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
