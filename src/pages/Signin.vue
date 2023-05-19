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
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3">
    <!-- different input components -->
    <div v-for="(authType, index) in getAuthTypes" :key="`id-${index}`">
      <NumberEntry
        v-if="isEntryNumber(authType)"
        ref="numberEntry"
        :label="numberEntryParameters.label"
        :placeholder="numberEntryParameters.placeholder"
        :isRequired="numberEntryParameters.required"
        :maxLengthOfEntry="numberEntryParameters.maxLengthOfEntry"
        :dbKey="numberEntryParameters.key"
        @updateNumber="updateUserInformation"
      />
      <PhoneNumberEntry
        v-if="isEntryPhoneNumber(authType)"
        ref="phoneNumberEntry"
        :label="phoneNumberEntryParameters.label"
        :placeholder="phoneNumberEntryParameters.placeholder"
        :isRequired="phoneNumberEntryParameters.required"
        :dbKey="phoneNumberEntryParameters.key"
        @updatePhoneNumber="updateUserInformation"
      />
      <Datepicker
        v-if="isEntryDate(authType)"
        ref="dateEntry"
        :label="dateEntryParameters.label"
        :isRequired="dateEntryParameters.required"
        :dbKey="dateEntryParameters.key"
        @updateDate="updateUserInformation"
      />
    </div>

    <!-- invalid login message -->
    <span
      v-html="invalidLoginMessage"
      v-if="isInvalidLoginMessageShown"
      class="mx-auto text-red-700 text-base mb-1 text-center md:text-sm"
    ></span>

    <!-- submit button -->
    <button
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 rounded disabled:opacity-50 btn"
      data-cy="submitButton"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
    >
      SIGN IN
    </button>

    <!-- signup button -->
    <button
      v-show="$store.state.sessionData.activateSignup"
      @click="redirectToSignUp"
      class="mx-auto pt-2 text-sm underline text-red-800"
    >
      If you are a new student, click here to register
    </button>
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";
import NumberEntry from "@/components/NumberEntry.vue";
import Datepicker from "@/components/Datepicker.vue";
import PhoneNumberEntry from "@/components/PhoneNumberEntry.vue";
import { authToInputParameters } from "../services/authToInputParameters";
import { validateUser } from "../services/validation.js";
import { redirectToDestination } from "../services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";

const assets = useAssets();
export default {
  name: "SignIn",
  components: {
    NumberEntry,
    Datepicker,
    PhoneNumberEntry,
  },
  data() {
    return {
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      invalidLoginMessage: "",
      mounted: false,
      numberEntryParameters: {},
      phoneNumberEntryParameters: {},
      dateEntryParameters: {},
      userInformation: {},
    };
  },

  mounted() {
    this.mounted = true;
  },
  computed: {
    /** returns an array of auth types for a session */
    getAuthTypes() {
      return this.$store.state.sessionData.authType;
    },

    /** returns images to be displayed for a group */
    getGroupImages() {
      return this.$store.state.groupData.images;
    },

    /** whether to show an invalid login message */
    isInvalidLoginMessageShown() {
      return this.invalidLoginMessage != "";
    },

    /** returns if the current session is using number entry */
    checkEntryTypeIsNumber() {
      return Object.keys(this.numberEntryParameters).length != 0;
    },

    /** returns if the current session is using date entry */
    checkEntryTypeIsDate() {
      return Object.keys(this.dateEntryParameters).length != 0;
    },

    /** returns if the current session is using phone number entry */
    checkEntryTypeIsPhoneNumber() {
      return Object.keys(this.phoneNumberEntryParameters).length != 0;
    },

    /** whether submit button is disabled */
    isSubmitButtonDisabled() {
      if (this.mounted) {
        return !(
          (this.checkEntryTypeIsNumber
            ? this.$refs.numberEntry["0"].isNumberEntryCompleteAndValid
            : true) &&
          (this.checkEntryTypeIsDate
            ? this.$refs.dateEntry["0"].isDateEntryCompleteAndValid
            : true) &&
          (this.checkEntryTypeIsPhoneNumber
            ? this.$refs.phoneNumberEntry["0"]
                .isPhoneNumberEntryCompleteAndValid
            : true)
        );
      }
      return true;
    },
  },
  methods: {
    /** given an authentication type, it finds a corresponding entry component */
    findEntryType(authType) {
      return Object.keys(authToInputParameters).find((key) => {
        if (Object.values(authToInputParameters[key]).includes(authType)) {
          return key;
        }
      });
    },

    /** given an authentication type, it returns UI parameters stored against a group */
    getUIParameters(authType) {
      let UIParameters;
      Object.keys(this.$store.state.groupData).find((key) => {
        if (key == authType) {
          UIParameters = this.$store.state.groupData[key.toString()];
        }
      });
      return UIParameters;
    },

    /** given an auth type, returns if the auth type is using number entry */
    isEntryNumber(authType) {
      if (this.findEntryType(authType) == "number") {
        this.numberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /** given an auth type, returns if the auth type is using phone number entry */
    isEntryPhoneNumber(authType) {
      if (this.findEntryType(authType) == "phoneNumber") {
        this.phoneNumberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /** given an auth type, returns if the auth type is using date entry */
    isEntryDate(authType) {
      if (this.findEntryType(authType) == "date") {
        this.dateEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /** authenticates the user */
    async authenticate() {
      let isUserValid = await validateUser(
        this.getAuthTypes,
        this.userInformation
      );
      if (!isUserValid) {
        this.invalidLoginMessage =
          "Student ID entered is incorrect. Please try again!";
      } else {
        if (
          redirectToDestination(
            this.$store.state.sessionData.purposeParams,
            this.userInformation["student_id"],
            this.$store.state.sessionData.redirectPlatformParams.id,
            this.$store.state.sessionData.redirectPlatform,
            this.$store.state.groupData.userType
          )
        ) {
          sendSQSMessage(
            this.$store.state.sessionData.purpose,
            this.$store.state.sessionData.purposeParams,
            this.$store.state.sessionData.redirectPlatform,
            this.$store.state.sessionData.redirectPlatformParams.id,
            this.userInformation,
            this.getAuthTypes,
            this.this.$store.state.sessionData.group,
            this.$store.state.groupData.userType,
            this.$store.state.sessionData.sessionId,
            this.$store.state.sessionData.userIpAddress,
            this.$store.state.sessionData.batch
          );
        }
      }
    },

    /** redirects to sign up */
    redirectToSignUp() {
      this.$router.push({
        name: "Signup",
      });
    },

    /** stores user information based on the value entered by user */
    updateUserInformation(value, dbKey) {
      this.userInformation[dbKey] = value;
    },
  },
};
</script>
