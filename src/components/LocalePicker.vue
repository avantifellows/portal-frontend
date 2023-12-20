<template>
  <div class="text-right">
    <FormKit
      v-model="locale"
      type="select"
      :options="options"
      :inner-class="{ 'p-2': true }"
      name="locale"
    />
  </div>
</template>

<script>
export default {
  name: "LocalePicker",
  props: {
    options: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      locale: "",
    };
  },
  mounted() {
    this.locale = this.$store.state.locale;
  },
  watch: {
    /**
     * Sets the language in the store based on the user input
     */
    locale() {
      if (this.locale == "English") {
        this.$store.dispatch("setLocale", "en");
      } else {
        this.$store.dispatch("setLocale", "hi");
      }
    },
  },
};
</script>
