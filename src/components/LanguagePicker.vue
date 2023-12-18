<template>
  <div class="text-right">
    <FormKit
      v-model="language"
      type="select"
      :options="options"
      :inner-class="{ 'p-2': true }"
      name="language"
    />
  </div>
</template>

<script>
export default {
  name: "LanguagePicker",
  props: {
    options: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      language: "English",
    };
  },
  watch: {
    /**
     * Sets the language in the store based on the user input
     */
    language() {
      if (this.language == "English") {
        this.$store.dispatch("setLanguage", "en");
      } else {
        this.$store.dispatch("setLanguage", "hi");
      }
    },
  },
};
</script>
