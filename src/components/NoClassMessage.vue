<template>
  <div class="fixed w-full top-1/4 my-5 flex justify-center">
    <div
      class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
    >
      <img :src="AFLogoSvg" class="w-32 m-auto" />
      <p
        class="text-center text-2xl sm:text-4xl py-4 sm:py-8"
        data-cy="noClassMessage"
      >
        {{ displayMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import useAssets from "@/assets/assets.js";
import '@formkit/themes/genesis'

const assets = useAssets();

export default {
  name: "NoClassMessage",
  data() {
    return {
      AFLogoSvg: assets.AFLogoSvg,
    };
  },
  computed: {
    displayMessage() {
      return this.isLocaleSelectedEnglish
        ? "There is no class right now."
        : "अभी आपकी कोई क्लास नहीं है|";
    },

    isLocaleSelectedEnglish() {
      return this.$store.state.locale == "en";
    },
    isLocaleSelectedHindi() {
      return this.$store.state.locale == "hi";
    },
  },
};
</script>
