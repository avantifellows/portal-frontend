<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p
        v-if="isLocaleSelectedEnglish"
        class="text-4xl font-bold text-gray-800"
      >
        Welcome to Portal!
      </p>
      <p v-if="isLocaleSelectedHindi" class="text-4xl font-bold text-gray-800">
        पोर्टल में आपका स्वागत है!
      </p>
      <p
        v-if="!isLocaleSelectedEnglish && !isLocaleSelectedHindi"
        class="text-4xl font-bold text-gray-800"
      >
        Welcome to Portal!
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandingPage",

  computed: {
    isLocaleSelectedEnglish() {
      return this.$store.state.locale == "en";
    },
    isLocaleSelectedHindi() {
      return this.$store.state.locale == "hi";
    },
  },
};
</script>
