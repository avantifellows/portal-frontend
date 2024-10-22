<template>
  <div class="flex flex-col min-h-screen">
    <nav class="p-4 flex justify-between items-center">
      <div class="text-left">
        <h1 class="text-2xl font-bold text-blue-600">Avanti Fellows</h1>
        <p class="text-sm text-gray-600">Enabling Equity in Education</p>
      </div>
      <button
        @click="toggleLocale"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ isEnglish ? 'हिंदी' : 'English' }}
      </button>
    </nav>
    <main class="flex-grow flex items-center justify-center py-16 px-4">
      <div class="text-center">
        <h2 class="text-6xl font-bold mb-6 text-black">
          {{ welcomeText }}
        </h2>
        <p class="text-xl mb-8 text-gray-600">
          {{ descriptionText }}
        </p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      isEnglish: true
    }
  },
  computed: {
    welcomeText() {
      return this.isEnglish ? 'Welcome to Our Portal' : 'हमारे पोर्टल में आपका स्वागत है'
    },
    descriptionText() {
      return this.isEnglish 
        ? 'Discover a world of educational possibilities' 
        : 'शैक्षिक संभावनाओं की एक दुनिया की खोज करें'
    }
  },
  methods: {
    toggleLocale() {
      this.isEnglish = !this.isEnglish
    }
  }
}
</script>