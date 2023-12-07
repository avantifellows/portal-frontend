<template>
  <div class="grid m-auto">
    <div class="">
      <p v-if="isLanguageSelectedEnglish" class="text-4xl">
        Welcome to Portal!
      </p>
      <p v-if="isLanguageSelectedHindi" class="text-4xl">
        पोर्टल में आपका स्वागत है!
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandingPage",

  computed: {
    isLanguageSelectedEnglish() {
      return this.$store.state.language == "en";
    },
    isLanguageSelectedHindi() {
      return this.$store.state.language == "hi";
    },
  },
};
</script>
