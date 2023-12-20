<template>
  <div class="grid m-auto">
    <div class="">
      <p v-if="isLocaleSelectedEnglish" class="text-4xl">Welcome to Portal!</p>
      <p v-if="isLocaleSelectedHindi" class="text-4xl">
        पोर्टल में आपका स्वागत है!
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
