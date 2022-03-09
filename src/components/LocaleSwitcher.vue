<template>
<!--main div-->
    <div
      class="fixed w-full top-1/4 my-5 flex justify-center z-100"
    >
      <div
        class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
      >
        <p class="text-center text-2xl sm:text-4xl py-4 sm:py-8">Select your language</p>
        <div class="grid grid-cols-2 space-x-2">
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
          >
            <p class="text-xl sm:text-3xl text-black text-center group-hover:text-white">
              English
            </p>
          </div>
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
          >
            <p class="text-xl sm:text-3xl text-black text-center group-hover:text-white">
              हिंदी
            </p>
          </div>
        </div>
      </div>
    </div>

</template>

<script>

export default {
  name: "LocaleSwitcher",
  props: {
    isBackgroundDisabled: Boolean,
  },
}
</script>
