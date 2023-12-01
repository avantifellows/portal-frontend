<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div class="flex h-12 md:h-24 justify-evenly mx-auto mt-20">
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col mx-auto my-auto h-full py-10 space-y-4">
    <!-- different input components -->
    <div
      v-for="(authType, index) in getAuthTypes"
      :key="`id-${index}`"
      class="mx-auto"
    >
      <NumberEntry
        v-if="isEntryNumber(authType)"
        ref="numberEntry"
        :label="numberEntryParameters.label"
        :placeholder="numberEntryParameters.placeholder"
        :isRequired="numberEntryParameters.required"
        :maxLengthOfEntry="numberEntryParameters.maxLengthOfEntry"
        :dbKey="numberEntryParameters.key"
        @update="updateUserInformation"
      />
      <PhoneNumberEntry
        v-if="isEntryPhoneNumber(authType)"
        ref="phoneNumberEntry"
        :label="phoneNumberEntryParameters.label"
        :placeholder="phoneNumberEntryParameters.placeholder"
        :isRequired="phoneNumberEntryParameters.required"
        :dbKey="phoneNumberEntryParameters.key"
        @update="updateUserInformation"
      />
      <Datepicker
        v-if="isEntryDate(authType)"
        ref="dateEntry"
        :label="dateEntryParameters.label"
        :isRequired="dateEntryParameters.required"
        :dbKey="dateEntryParameters.key"
        @update="updateUserInformation"
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
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-3 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
    >
      SIGN IN
    </button>

    <!-- signup button -->
    <button
      v-show="isSignupActivated"
      @click="redirectToSignUp"
      class="mx-auto pt-2 text-xs md:text-sm underline text-red-800"
    >
      {{ signUpText }}
    </button>
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";

import NumberEntry from "@/components/NumberEntry.vue";
import Datepicker from "@/components/Datepicker.vue";
import PhoneNumberEntry from "@/components/NewPhoneNumberEntry.vue";

import { authToInputParameters } from "@/services/authToInputParameters";
import { validateUser } from "@/services/newValidation.js";
import { redirectToDestination } from "@/services/redirectToDestination";
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
      invalidLoginMessage: "", // message to display when login is invalid
      mounted: false,
      numberEntryParameters: {}, // stores UI parameters for number entry component
      phoneNumberEntryParameters: {}, // stores UI parameters for phone number entry component
      dateEntryParameters: {}, // stores UI parameters for date entry component
      userInformation: {}, // stores data about the user
    };
  },
  mounted() {
    this.mounted = true;
  },

  computed: {
    /** Retutns if sign up flow should be activated */
    isSignupActivated() {
      return this.$store.state.sessionData.activate_signup == 'True';
    },

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.language;
    },

    /** Returns text based on locale */
    signUpText() {
      return this.getLocale == "en"
        ? "If you are a new student, click here to register"
        : "यदि आप नए छात्र हैं, तो पंजीकरण करने के लिए यहां क्लिक करें";
    },

    /**
     * Retrieves the authentication types.
     * @returns {string[]} An array of authentication types.
     */
    getAuthTypes() {
      return this.$store.state.sessionData.auth_type.split(",");
    },

    /**
     * Retrieves the group images.
     * @returns {string[]} An array of group images.
     */
    getGroupImages() {
      return this.$store.state.groupData.input_schema.images;
    },

    /**
     * Checks if the invalid login message is shown.
     * @returns {boolean} True if the invalid login message is not empty, false otherwise.
     */
    isInvalidLoginMessageShown() {
      return this.invalidLoginMessage != "";
    },

    /**
     * Checks if the entry type is a number.
     * @returns {boolean} True if the entry type is a number, false otherwise.
     */
    checkEntryTypeIsNumber() {
      return Object.keys(this.numberEntryParameters).length != 0;
    },

    /**
     * Checks if the entry type is a date.
     * @returns {boolean} True if the entry type is a date, false otherwise.
     */
    checkEntryTypeIsDate() {
      return Object.keys(this.dateEntryParameters).length != 0;
    },

    /**
     * Checks if the entry type is a phone number.
     * @returns {boolean} True if the entry type is a phone number, false otherwise.
     */
    checkEntryTypeIsPhoneNumber() {
      return Object.keys(this.phoneNumberEntryParameters).length != 0;
    },

    /**
     * Checks if the submit button is disabled.
     * @returns {boolean} True if the submit button is disabled, false otherwise.
     * */
    isSubmitButtonDisabled() {
      if (this.mounted) {
        return !(
          (this.checkEntryTypeIsNumber
            ? this.$refs.numberEntry["0"].isNumberEntryValid
            : true) &&
          (this.checkEntryTypeIsDate
            ? this.$refs.dateEntry["0"].isDateEntryValid
            : true) &&
          (this.checkEntryTypeIsPhoneNumber
            ? this.$refs.phoneNumberEntry["0"].isPhoneNumberEntryValid
            : true)
        );
      }
      return true;
    },
  },
  methods: {
    /**
     * Finds the entry type based on the provided authentication type.
     * @param {string} authType - The authentication type.
     * @returns {string|undefined} The entry type corresponding to the authentication type, or undefined if not found.
     */
    findEntryType(authType) {
      return Object.keys(authToInputParameters).find((key) => {
        if (Object.values(authToInputParameters[key]).includes(authType)) {
          return key;
        }
      });
    },

    /**
     * Retrieves the UI parameters for the given authentication type.
     * @param {string} authType - The authentication type.
     * @returns {object|undefined} The UI parameters corresponding to the authentication type, or undefined if not found.
     */
    getUIParameters(authType) {
      let UIParameters;
      Object.keys(this.$store.state.groupData.locale_data[this.getLocale]).find(
        (key) => {
          if (key == authType) {
            UIParameters =
              this.$store.state.groupData.locale_data[this.getLocale][
                key.toString()
              ];
          }
        }
      );
      return UIParameters;
    },

    /**
     * Checks if the entry type for the given authentication type is "number".
     * @param {string} authType - The authentication type.
     * @returns {boolean} True if the entry type is "number", false otherwise.
     */
    isEntryNumber(authType) {
      if (this.findEntryType(authType) == "number") {
        this.numberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /**
     * Checks if the entry type for the given authentication type is "phoneNumber".
     * @param {string} authType - The authentication type.
     * @returns {boolean} True if the entry type is "phoneNumber", false otherwise.
     */
    isEntryPhoneNumber(authType) {
      if (this.findEntryType(authType) == "phoneNumber") {
        this.phoneNumberEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /**
     * Checks if the entry type for the given authentication type is "date".
     * @param {string} authType - The authentication type.
     * @returns {boolean} True if the entry type is "date", false otherwise.
     */
    isEntryDate(authType) {
      if (this.findEntryType(authType) == "date") {
        this.dateEntryParameters = this.getUIParameters(authType);
        return true;
      }
      return false;
    },

    /**
     * Updates the user information object with the provided value for the specified database key.
     * @param {string} value - The value to update.
     * @param {string} dbKey - The key corresponding to the user information field in the database.
     */
    updateUserInformation(value, dbKey) {
      this.userInformation[dbKey] = value;
    },

    /**
     * Performs authentication by validating the user and redirecting user only if valid.
     * @returns {Promise<void>} A Promise that resolves once the authentication process is complete.
     */
    async authenticate() {
      let isUserValid = await validateUser(
        this.getAuthTypes,
        this.userInformation,
        this.$store.state.groupData.input_schema.userType
      );
      if (!isUserValid.isUserIdValid) {
        this.invalidLoginMessage = "ID entered is incorrect. Please try again!";
      } else if (
        this.getAuthTypes.includes("DOB") &&
        !isUserValid.isDateOfBirthValid
      ) {
        this.invalidLoginMessage =
          "Date of birth entered is incorrect. Please try again!";
      } else if (
        this.getAuthTypes.includes("PH") &&
        !isUserValid.isPhoneNumberValid
      ) {
        this.invalidLoginMessage =
          "Phone number entered is incorrect. Please try again!";
      } else {
        if (this.$store.state.sessionData.pop_up_form == 'True') {
          this.$router.push(`/form/${this.userInformation["student_id"]}`);
          sendSQSMessage(
            "sign-in",
            this.$store.state.sessionData.purpose["sub-type"],
            this.$store.state.sessionData.platform,
            this.$store.state.sessionData.platform_id,
            this.userInformation["student_id"],
            this.getAuthTypes.toString(),
            this.$store.state.groupData.name,
            this.$store.state.groupData.input_schema.userType,
            this.$store.state.sessionData.session_id,
            "",
            "phone" in this.userInformation
              ? this.userInformation["phone"]
              : "",
            this.$store.state.sessionData.meta_data.batch,
            "date_of_birth" in this.userInformation
              ? this.userInformation["date_of_birth"]
              : ""
          );
        } else {
          if (
            redirectToDestination(
              this.$store.state.sessionData.purpose.params,
              this.userInformation["student_id"],
              this.$store.state.sessionData.platform_id,
              this.$store.state.sessionData.platform,
              this.$store.state.groupData.input_schema.userType
            )
          ) {
            sendSQSMessage(
              "sign-in",
              this.$store.state.sessionData.purpose["sub-type"],
              this.$store.state.sessionData.platform,
              this.$store.state.sessionData.platform_id,
              this.userInformation["student_id"],
              this.getAuthTypes.toString(),
              this.$store.state.groupData.name,
              this.$store.state.groupData.input_schema.userType,
              this.$store.state.sessionData.session_id,
              "",
              "phone" in this.userInformation
                ? this.userInformation["phone"]
                : "",
              this.$store.state.sessionData.meta_data.batch,
              "date_of_birth" in this.userInformation
                ? this.userInformation["date_of_birth"]
                : ""
            );
          }
        }
      }
    },

    /**
     * Redirects the user to the sign-up page.
     */
    redirectToSignUp() {
      this.$router.push({
        name: "NewSignup",
      });
    },
  },
};
</script>
