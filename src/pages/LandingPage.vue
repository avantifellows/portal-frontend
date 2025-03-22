<template>
  <div class="relative min-h-screen flex flex-col">
    <!-- Language Picker at Top Right -->
    <div class="absolute top-4 right-4 z-10">
      <LocalePicker :options="getLocaleOptions" />
    </div>
    <div class="flex-grow flex items-center justify-center flex-col">
      <div class="text-center">
        <p v-if="isLocaleSelectedEnglish" class="text-4xl">
          Welcome to Portal!
        </p>
        <p v-if="isLocaleSelectedHindi" class="text-4xl">
          पोर्टल में आपका स्वागत है!
        </p>
        <!-- Scroll Button  -->
        <button
          @click="scrollToLogin"
          class="mt-8 px-6 py-3 bg-teal-600 text-white rounded-md flex flex-col items-center hover:bg-teal-700 transition duration-200"
        >
          <span v-if="isLocaleSelectedEnglish">Login</span>
          <span v-if="isLocaleSelectedHindi">लॉगिन करें</span>
          <svg
            class="w-4 h-4 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LocalePicker from "@/components/LocalePicker.vue";
export default {
  name: "LandingPage",
  components: {
    LocalePicker,
  },

  computed: {
    getLocaleOptions() {
      return this.$store.state.authGroupData
        ? this.$store.state.authGroupData.locale.split(",")
        : ["English"];
    },
    isLocaleSelectedEnglish() {
      return this.$store.state.locale === "en";
    },
    isLocaleSelectedHindi() {
      return this.$store.state.locale === "hi";
    },
  },
  methods: {
    scrollToLogin() {
      // scroll to next section
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    },
  },
};
</script>
