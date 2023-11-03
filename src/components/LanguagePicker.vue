<template>
  <div class="text-right">
    <FormKit
      type="select"
      :options="['English', 'हिंदी']"
      @update="updateLanguage"
      :inner-class="{
        'p-2': true,
      }"
    />
  </div>
</template>

<script>
export default {
  name: "LanguagePicker",
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
