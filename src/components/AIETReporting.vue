<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div
    class="flex w-11/12 h-10 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20"
    :class="{ 'opacity-20 pointer-events-none': isLoading }"
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3">
    <PhoneNumberEntry
      @resetInvalidLoginMessage="resetInvalidLoginMessage"
      ref="phoneNumberEntry"
    />
    <span class="mx-auto text-xs mt-0 p-0 text-gray-500"
      >Enter the phone number you registered with</span
    >
    <span
      v-if="isInvalidLoginMessageShown"
      class="mx-auto text-red-700 mb-1 text-center text-xs md:text-sm"
      >Phone Number does not exist!
    >
    <button
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
      data-cy="submitButton"
    >
      GET REPORT
    </button>
  </div>
</template>
<script>
import PhoneNumberEntry from "./PhoneNumberEntry.vue";
import userAPI from "@/services/API/user.js";
import useAssets from "@/assets/assets.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";

const assets = useAssets();
export default {
  name: "AIETReporting",
  components: { PhoneNumberEntry },
  data() {
    return {
      mounted: false,
      isInvalidLoginMessageShown: false,
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      isUserValid: false,
    };
  },
  mounted() {
    this.mounted = true;
    console.log(this.$route.params);
  },
  computed: {
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    resetInvalidLoginMessage() {
      this.invalidLoginMessage = "";
    },
    basicValidationType() {
      return this.$store.state.groupData.input.basicValidationType;
    },
    isSubmitButtonDisabled() {
      if (this.mounted) {
        return (
          (this.$refs.phoneNumberEntry &&
            this.$refs.phoneNumberEntry.isPhoneNumberNotComplete()) ||
          this.isInvalidLoginMessageShown
        );
      }
    },
  },
  methods: {
    async authenticate() {
      this.isLoading = true;
      this.isUserValid = await userAPI.verifyAIETStudent(
        this.$refs.phoneNumberEntry.phoneNumber,
        this.$route.params.dateOfBirth
      );
      console.log(this.isUserValid, this.$route.params.redirectId);
      this.isLoading = false;
      if (this.isUserValid) {
        if (
          redirectToDestination(
            "reporting",
            this.$route.params.id,
            this.$route.params.redirectId,
            "report",
            "",
            "EnableStudents"
          )
        ) {
          sendSQSMessage(
            "attendance",
            "reporting",
            "report",
            this.$route.params.redirectId,
            [{ userID: this.$route.params.id, valid: "False" }],
            "ID,DOB",
            "EnableStudents",
            this.$store.state.groupData.userType,
            "",
            "",
            this.$refs.phoneNumberEntry
              ? this.$refs.phoneNumberEntry.phoneNumber
              : "",
            ""
          );
        }
      } else {
        this.isInvalidLoginMessageShown = true;
      }
    },
  },
};
</script>
