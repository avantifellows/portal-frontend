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
    <template v-for="(image, index) in $store.state.images" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col mx-auto my-auto h-full py-10">
    <!-- different input components -->
    <div
      v-for="(authType, index) in auth_type"
      :key="`id-${index}`"
      class="mx-auto w-56 my-2"
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
        @resetInvalidLoginMessage="resetInvalidLoginMessage"
        :invalid="isInvalidLoginMessageShown"
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
      class="text-red text-sm text-center font-bold mt-[10px]"
    />

    <!-- submit button -->
    <button
      class="mt-[10px] bg-primary hover:bg-primary-hover disabled:bg-primary-hover text-white text-base mx-auto w-48 p-2 rounded shadow-md"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
    >
      {{ signInButtonLabel }}
    </button>
    <div
      v-show="enable_signup"
      class="mt-[30px] flex w-48 mx-auto justify-between items-center"
    >
      <hr class="w-20 text-grey" />
      <p class="text-grey font-roboto text-sm opacity-40">or</p>
      <hr class="w-20 text-grey" />
    </div>

    <!-- signup button -->
    <button
      v-show="enable_signup"
      @click="redirectToSignUp"
      class="mt-[20px] mx-auto pt-2 text-primary text-base"
      v-html="signUpText"
    />
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
import { createAccessToken } from "@/services/API/token";

const assets = useAssets();

export default {
  name: "SignIn",
  components: {
    NumberEntry,
    Datepicker,
    PhoneNumberEntry,
  },
  props: {
    sub_type: {
      default: "",
      type: String,
    },
    auth_type: {
      default: [],
      type: Array,
    },
    enable_signup: {
      default: false,
      type: Boolean,
    },
    enable_pop_up_form: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      locale: this.$store.state.locale,
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      invalidLoginMessage: "", // message to display when login is invalid
      mounted: false,
      numberEntryParameters: {}, // stores UI parameters for number entry component
      phoneNumberEntryParameters: {}, // stores UI parameters for phone number entry component
      dateEntryParameters: {}, // stores UI parameters for date entry component
      userInformation: {}, // stores data about the user
      invalidLoginMessageTranslations: {
        ID: {
          en: "This ID is not registered. Try again",
          hi: "यह आईडी पंजीकृत नहीं है। पुनः प्रयास करें",
        },
        DOB: {
          en: "This date of birth is not registered. Try again",
          hi: "यह जन्मतिथि पंजीकृत नहीं है। पुनः प्रयास करें",
        },
        PH: {
          en: "This phone number is not registered. Try again",
          hi: "यह फ़ोन नंबर पंजीकृत नहीं है। पुनः प्रयास करें",
        },
      },
    };
  },
  mounted() {
    this.mounted = true;
  },
  computed: {
    /** Returns button text */
    signInButtonLabel() {
      return this.locale == "en" ? "Sign In" : "साइन इन";
    },

    /** Retutns if sign up flow should be activated */
    isSignupActivated() {
      return this.$store.state.sessionData.activate_signup == "True";
    },

    /** Returns text based on locale */
    signUpText() {
      return this.locale == "en"
        ? "New Student? <b> Register Now</b>"
        : "नया छात्र? <b>अब रजिस्टर करें। </b>";
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
    getBatch() {
      return "sessionData" in this.$store.state &&
        "meta_data" in this.$store.state.sessionData &&
        "batch" in this.$store.state.sessionData.meta_data
        ? this.$store.state.sessionData.meta_data.batch
        : "";
    },
  },
  methods: {
    /** Resets the invalid login message to empty string */
    resetInvalidLoginMessage() {
      this.invalidLoginMessage = "";
    },

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
      Object.keys(this.$store.state.groupData.locale_data[this.locale]).find(
        (key) => {
          if (key == authType) {
            UIParameters =
              this.$store.state.groupData.locale_data[this.locale][
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
        this.auth_type,
        this.userInformation,
        this.$store.state.groupData.input_schema.userType,
        this.$store.state.groupData.id
      );

      if (!isUserValid.isUserIdValid) {
        this.invalidLoginMessage =
          this.invalidLoginMessageTranslations["ID"][this.locale];
      } else if (
        this.auth_type.includes("DOB") &&
        !isUserValid.isDateOfBirthValid
      ) {
        this.invalidLoginMessage =
          this.invalidLoginMessageTranslations["DOB"][this.locale];
      } else if (
        this.auth_type.includes("PH") &&
        !isUserValid.isPhoneNumberValid
      ) {
        this.invalidLoginMessage =
          this.invalidLoginMessageTranslations["PH"][this.locale];
      } else {
        createAccessToken(this.userInformation["student_id"]);

        if (this.enable_pop_up_form) {
          this.$router.push(`/form/${this.userInformation["student_id"]}`);
          sendSQSMessage(
            "sign-in",
            this.sub_type,
            this.$store.state.platform,
            this.$store.state.platform_id,
            this.userInformation["student_id"],
            this.auth_type.toString(),
            this.$store.state.groupData.name,
            this.$store.state.groupData.input_schema.userType,
            this.$store.state.sessionData.session_id,
            "",
            "phone" in this.userInformation
              ? this.userInformation["phone"]
              : "",
            this.getBatch,
            "date_of_birth" in this.userInformation
              ? this.userInformation["date_of_birth"]
              : ""
          );
        } else {
          if (
            redirectToDestination(
              this.sub_type,
              this.userInformation["student_id"],
              this.$store.state.platform_id,
              this.$store.state.platform,
              this.$store.state.groupData.input_schema.userType
            )
          ) {
            sendSQSMessage(
              "sign-in",
              this.sub_type,
              this.$store.state.platform,
              this.$store.state.platform_id,
              "student_id" in this.userInformation
                ? this.userInformation["student_id"]
                : this.userInformation["teacher_id"],
              this.auth_type.toString(),
              this.$store.state.groupData.name,
              this.$store.state.groupData.input_schema.userType,
              "sessionData" in this.$store.state &&
                "session_id" in this.$store.state.sessionData
                ? this.$store.state.sessionData.session_id
                : "",
              "",
              "phone" in this.userInformation
                ? this.userInformation["phone"]
                : "",
              this.getBatch,
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
