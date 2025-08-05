<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    data-testid="error-page"
  >
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <inline-svg class="mx-auto h-16 w-16 text-red" :src="warningSvg" />
        <h2 class="mt-6 text-3xl font-bold text-black">
          {{ getTitle }}
        </h2>
        <p class="mt-2 text-sm text-grey">
          {{ getDescription }}
        </p>
        <p class="mt-4 text-base text-black leading-relaxed">
          {{ text }}
        </p>
      </div>

      <div class="mt-6 text-center">
        <p class="text-xs text-grey">
          If this problem persists, please contact your Program Manager.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import useAssets from "@/assets/assets.js";

const assets = useAssets();
export default {
  name: "Error",
  props: {
    type: {
      type: String,
      default: "404",
    },
    text: {
      type: String,
      default: "URL is not correct. Please check and try again!",
    },
  },
  data() {
    return {
      warningSvg: assets.warningSvg,
    };
  },
  computed: {
    /** whether the error type is 404 */
    isError404() {
      return this.type === "404";
    },
    isError500() {
      return this.type === "500";
    },
    getTitle() {
      if (this.isError404) return "Page Not Found";
      if (this.isError500) return "Server Error";
      return "Something Went Wrong";
    },
    getDescription() {
      if (this.isError404) return "The page you're looking for doesn't exist.";
      if (this.isError500) return "We're experiencing technical difficulties.";
      return "An unexpected error occurred.";
    },
  },
};
</script>
