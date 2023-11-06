<template>
  <div class="text-right">
    <FormKit
      v-model="language"
      type="select"
      :options="['English', 'हिंदी']"
      :inner-class="{
        'p-2': true,
      }"
    />
  </div>
</template>

<script>
export default {
  name: "LanguagePicker",
  data() {
    return {
      language: this.$store.state.language,
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
