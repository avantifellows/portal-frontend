<template>
  <div class="fixed w-full top-1/4 my-5 flex justify-center">
    <div
      class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
    >
      <img
        :src="AFLogo"
        class="w-32  m-auto"
      >
      <p class="text-center text-2xl sm:text-4xl py-4 sm:py-8">
        There is no class now. <br>Please check the timetable.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "NoClassMessage",
  data(){
    return {
      AFLogo: new URL('/AF_favicon.png', import.meta.url).href
    }
  }
};
</script>
