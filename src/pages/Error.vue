<template>
  <div class="flex flex-col space-y-8 items-center">
    <!-- 404 -->
    <div v-if="isError404" class="w-full mt-16 flex flex-col space-y-4 items-center">
      <inline-svg class="w-12 h-12 text-yellow-600 fill-current" :src="warningSvg" />

      <p class="text-2xl align-middle">Page Not Found</p>
      <p class="text-lg text-gray-500 text-center w-10/12 sm:w-1/2">
        {{ text }}
      </p>
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
  },
};
</script>
