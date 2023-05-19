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
    getAuthTypes() {
      return this.$store.state.sessionData.authType;
    },
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    isInvalidLoginMessageShown() {
      return this.invalidLoginMessage != "";
    },
    isSubmitButtonDisabled() {
      if (this.mounted) {
        return !(
          (Object.keys(this.numberEntryParameters).length != 0
            ? this.$refs.numberEntry["0"].isNumberEntryCompleteAndValid
            : true) &&
          (Object.keys(this.dateEntryParameters).length != 0
            ? this.$refs.dateEntry["0"].isDateEntryCompleteAndValid
            : true) &&
          (Object.keys(this.phoneNumberEntryParameters).length != 0
            ? this.$refs.phoneNumberEntry["0"]
                .isPhoneNumberEntryCompleteAndValid
            : true)
        );
      }
      return true;
    },
  },
  methods: {
    findEntryType(authType) {
      return Object.keys(authToInputParameters).find((key) => {
        if (Object.values(authToInputParameters[key]).includes(authType)) {
          return key;
        }
      });
    },
    getUIParameters(authType) {
      let UIParameters;
      Object.keys(this.$store.state.groupData).find((key) => {
        if (key == authType) {
          UIParameters = this.$store.state.groupData[key.toString()];
        }
      });
      return UIParameters;
    },
    isEntryNumber(authType) {
      if (this.findEntryType(authType) == "number") {
        this.numberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },
    isEntryPhoneNumber(authType) {
      if (this.findEntryType(authType) == "phoneNumber") {
        this.phoneNumberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },
    isEntryDate(authType) {
      if (this.findEntryType(authType) == "date") {
        this.dateEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },
    async authenticate() {
      let isUserValid = await validateUser(
        this.getAuthTypes,
        this.userInformation
      );
      if (!isUserValid) {
        this.invalidLoginMessage =
          "Student ID entered is incorrect. Please try again!";
      } else {
        console.log("here");
        if (
          redirectToDestination(
            this.purposeParams,
            this.userIDList,
            this.redirectId,
            this.redirectTo,
            this.authType,
            this.group
          )
        ) {
          sendSQSMessage(
            this.purpose,
            this.purposeParams,
            this.redirectTo,
            this.redirectId,
            this.userIDList,
            this.authType,
            this.group,
            this.$store.state.groupData.userType,
            this.sessionId,
            this.userIpAddress,
            this.isExtraInputValidationRequired && this.isInputPhoneNumber
              ? this.$refs.phoneNumberEntry.phoneNumber
              : "",
            this.$store.state.sessionData.batch
          );
        }
      }
    },
    redirectToSignUp() {
      this.$router.push({
        name: "Signup",
      });
    },
    updateUserInformation(value, dbKey) {
      this.userInformation[dbKey] = value;
    },
  },
};
</script>
