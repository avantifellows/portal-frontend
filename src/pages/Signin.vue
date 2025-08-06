<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <LocalePicker :options="getLocaleOptions" />
  <div
    class="flex w-full h-28 justify-evenly md:w-4/5 md:h-32 xl:w-3/4 mx-auto mt-20"
  >
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
        :isTypeSignIn="is_type_signin"
        :label="numberEntryParameters.label"
        :placeholder="numberEntryParameters.placeholder"
        :isRequired="numberEntryParameters.required"
        :maxLengthOfEntry="numberEntryParameters.maxLengthOfEntry"
        :dbKey="numberEntryParameters.key"
        @update="updateUserInformation"
        @resetInvalidLoginMessage="resetInvalidLoginMessage"
        :invalid="isInvalidLoginMessageShown"
        data-testid="auth-id-input"
      />
      <PhoneNumberEntry
        v-if="isEntryPhoneNumber(authType)"
        ref="phoneNumberEntry"
        :label="phoneNumberEntryParameters.label"
        :placeholder="phoneNumberEntryParameters.placeholder"
        :isRequired="phoneNumberEntryParameters.required"
        :dbKey="phoneNumberEntryParameters.key"
        @update="updateUserInformation"
        data-testid="auth-phone-input"
        :disabled="showOTPFlow"
      />
      <Datepicker
        v-if="isEntryDate(authType)"
        ref="dateEntry"
        :label="dateEntryParameters.label"
        :isRequired="dateEntryParameters.required"
        :dbKey="dateEntryParameters.key"
        @update="updateUserInformation"
        data-testid="auth-date-input"
      />
      <CodeEntry
        v-if="isEntryCode(authType)"
        ref="codeEntry"
        :label="codeEntryParameters.label"
        :isRequired="codeEntryParameters.required"
        :maxLengthOfEntry="codeEntryParameters.maxLengthOfEntry"
        :dbKey="codeEntryParameters.key"
        @update="updateUserInformation"
        data-testid="auth-code-input"
        @resetInvalidLoginMessage="resetInvalidLoginMessage"
        :invalid="isInvalidLoginMessageShown"
      />
    </div>

    <!-- invalid login message -->
    <span
      v-html="invalidLoginMessage"
      v-if="isInvalidLoginMessageShown"
      class="text-red text-sm text-center font-bold mt-[10px]"
    />

    <!-- privacy policy checkbox -->
    <div class="mx-auto w-56">
      <PrivacyPolicyCheckbox v-model="privacyPolicyAccepted" />
    </div>

    <!-- OTP Flow for PH auth type -->
    <div v-if="showOTPFlow" class="mx-auto w-56">
      <!-- OTP input field -->
      <div v-if="isOTPSent" class="mb-4">
        <p class="text-base mb-2 text-center font-semibold">
          Enter OTP sent to your phone
        </p>
        <input
          v-model="OTPCode"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Enter OTP"
          class="border py-2 px-2 w-full rounded mx-auto border-grey text-center"
          maxlength="6"
        />
      </div>

      <!-- Request OTP button -->
      <button
        v-if="!isOTPSent"
        @click="sendOTP"
        class="mt-[10px] bg-primary hover:bg-primary-hover disabled:bg-primary-hover text-white text-base mx-auto w-48 p-2 rounded shadow-md block"
        :disabled="!phoneVerified"
      >
        Send OTP
      </button>

      <!-- Verify OTP button -->
      <button
        v-if="isOTPSent"
        @click="verifyOTP"
        class="mt-[10px] bg-primary hover:bg-primary-hover disabled:bg-primary-hover text-white text-base mx-auto w-48 p-2 rounded shadow-md block"
        :disabled="OTPCode.length < 4"
      >
        Verify OTP
      </button>

      <!-- Resend OTP button -->
      <button
        v-if="isOTPSent && resendOTPTimeLimit === 0"
        @click="sendOTP"
        class="mt-[10px] bg-gray-500 hover:bg-gray-600 text-white text-base mx-auto w-48 p-2 rounded shadow-md block"
      >
        Resend OTP
      </button>

      <!-- Countdown timer -->
      <p
        v-if="isOTPSent && resendOTPTimeLimit > 0"
        class="text-center mt-2 text-gray-600"
      >
        Resend OTP in {{ formattedResendTimer }}
      </p>

      <!-- OTP response message -->
      <p
        v-if="displayOTPMessage.message"
        :class="displayOTPMessageClass"
        class="text-center mt-2"
      >
        {{ displayOTPMessage.message }}
      </p>
    </div>

    <!-- Regular submit button for non-PH auth types -->
    <button
      v-if="!showOTPFlow"
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
      class="mt-[20px] mx-auto pt-2 text-primary text-base text"
      data-testid="signup-button"
      v-html="signUpText"
    />
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";

import NumberEntry from "@/components/NumberEntry.vue";
import Datepicker from "@/components/Datepicker.vue";
import PhoneNumberEntry from "@/components/PhoneNumberEntry.vue";
import CodeEntry from "@/components/CodeEntry.vue";
import LocalePicker from "@/components/LocalePicker.vue";
import PrivacyPolicyCheckbox from "@/components/PrivacyPolicyCheckbox.vue";

import { authToInputParameters } from "@/services/authToInputParameters";
import { validateUser } from "@/services/authValidation.js";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";
import TokenAPI from "@/services/API/token";
import UserAPI from "@/services/API/user.js";
import OTPAuth from "@/services/API/otp.js";
import {
  mapVerifyStatusCodeToMessage,
  mapSendStatusCodeToMessage,
} from "@/services/OTPCodes.js";

const assets = useAssets();

export default {
  name: "SignIn",
  components: {
    NumberEntry,
    Datepicker,
    PhoneNumberEntry,
    CodeEntry,
    LocalePicker,
    PrivacyPolicyCheckbox,
  },
  props: {
    is_type_signin: {
      default: true,
      type: Boolean,
    },
    auth_type: {
      default: [],
      type: Array,
    },
    enable_signup: {
      default: false,
      type: Boolean,
    },
    enable_popup: {
      default: false,
      type: Boolean,
    },
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
      codeEntryParameters: {}, // stores UI parameters for code entry component
      userInformation: {}, // stores data about the user
      privacyPolicyAccepted: true, // privacy policy checkbox state (default: checked)
      // OTP-related states
      showOTPFlow: false, // whether to show OTP input and verification
      isOTPSent: false, // whether OTP has been sent
      OTPCode: "", // OTP entered by user
      displayOTPMessage: { message: "", status: "" }, // OTP service messages
      resendOTPTimeLimit: 60, // countdown timer for resend
      OTPInterval: null, // timer interval
      phoneVerified: false, // whether phone number is verified in database
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
        CODE: {
          en: "This code is not registered. Try again",
          hi: "यह कोड पंजीकृत नहीं है। पुनः प्रयास करें",
        },
      },
    };
  },
  mounted() {
    this.mounted = true;
  },
  computed: {
    getLocaleOptions() {
      return this.$store.state.authGroupData &&
        this.$store.state.authGroupData.locale
        ? this.$store.state.authGroupData.locale.split(",")
        : ["English"];
    },

    locale() {
      return this.$store.state.locale;
    },
    /** Returns button text */
    signInButtonLabel() {
      return this.locale == "en" ? "Login" : "लॉग इन";
    },

    /** Returns if sign up flow should be activated */
    isSignupActivated() {
      return this.$store.state.sessionData.activate_signup == "True";
    },

    /** Returns text based on locale */
    signUpText() {
      return this.locale == "en"
        ? "<span>New User?</span> <b> Register Now</b>"
        : "<span>नया छात्र?</span><b>अब रजिस्टर करें। </b>";
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
     * Checks if the entry type is a code.
     * @returns {boolean} True if the entry type is a code, false otherwise.
     */
    checkEntryTypeIsCode() {
      return Object.keys(this.codeEntryParameters).length != 0;
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
            : true) &&
          (this.checkEntryTypeIsCode
            ? this.$refs.codeEntry["0"].isCodeEntryValid
            : true) &&
          this.privacyPolicyAccepted
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

    /** Check if auth type includes phone number authentication */
    includesPhoneAuth() {
      return this.auth_type.includes("PH");
    },

    /** Format for the resend timer */
    formattedResendTimer() {
      const minutes = Math.floor(this.resendOTPTimeLimit / 60);
      let seconds = this.resendOTPTimeLimit % 60;
      if (seconds < 10) {
        seconds = `0${seconds}`;
      }
      return `${minutes}:${seconds}`;
    },

    /** CSS classes for OTP message display */
    displayOTPMessageClass() {
      return this.displayOTPMessage.status === "failure"
        ? "text-red-600 text-sm"
        : "text-green-600 text-sm";
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
      Object.keys(
        this.$store.state.authGroupData.locale_data[this.locale]
      ).find((key) => {
        if (key == authType) {
          UIParameters =
            this.$store.state.authGroupData.locale_data[this.locale][
              key.toString()
            ];
        }
      });
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
     * Checks if the entry type for the given authentication type is "code".
     * @param {string} authType - The authentication type.
     * @returns {boolean} True if the entry type is "code", false otherwise.
     */
    isEntryCode(authType) {
      if (this.findEntryType(authType) == "code") {
        this.codeEntryParameters = this.getUIParameters(authType);
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

    /** Send OTP to verified phone number */
    async sendOTP() {
      if (!this.phoneVerified || !this.userInformation.phone) return;

      try {
        const response = await OTPAuth.sendOTP(
          parseInt(this.userInformation.phone)
        );
        let responseStatusCodeAndMessage = response.data.split("|");
        const responseStatusMessage = responseStatusCodeAndMessage[0];

        this.displayOTPMessage = mapSendStatusCodeToMessage(
          responseStatusMessage.trim()
        );

        if (this.displayOTPMessage.status === "success") {
          this.isOTPSent = true;
          this.resendOTPTimeLimit = 60;
          this.startResendTimer();
        }
      } catch (error) {
        console.error("Send OTP error:", error);
        this.displayOTPMessage = {
          message: "Failed to send OTP. Please try again.",
          status: "failure",
        };
      }
    },

    /** Verify OTP entered by user */
    async verifyOTP() {
      if (!this.OTPCode || !this.userInformation.phone) return;

      try {
        const response = await OTPAuth.verifyOTP(
          parseInt(this.userInformation.phone),
          this.OTPCode
        );

        let responseStatusCodeAndMessage = response.data.split("|");
        const responseStatusMessage = responseStatusCodeAndMessage[0];
        const responseStatusCode = responseStatusCodeAndMessage[1];

        if (responseStatusMessage.trim() === "success") {
          // OTP verified successfully, proceed with authentication
          this.displayOTPMessage = {
            message: "OTP verified successfully!",
            status: "success",
          };

          // Proceed with final authentication and redirection
          await this.completePhoneAuthentication();
        } else {
          this.displayOTPMessage = mapVerifyStatusCodeToMessage[
            responseStatusCode.trim().toString()
          ] || {
            message: "Invalid OTP. Please try again.",
            status: "failure",
          };
        }
      } catch (error) {
        console.error("Verify OTP error:", error);
        this.displayOTPMessage = {
          message: "Failed to verify OTP. Please try again.",
          status: "failure",
        };
      }
    },

    /** Complete phone authentication after OTP verification */
    async completePhoneAuthentication() {
      try {
        const userId = this.userInformation.phone;

        // Send SQS message
        await sendSQSMessage(
          "sessionData" in this.$store.state &&
            "type" in this.$store.state.sessionData
            ? this.$store.state.sessionData.type
            : "sign-in",
          "", // deprecated sub_type
          this.$store.state.platform,
          this.$store.state.platform_id,
          userId,
          this.auth_type.toString(),
          this.$store.state.authGroupData.name,
          this.$store.state.authGroupData.input_schema.user_type,
          "sessionData" in this.$store.state &&
            "session_id" in this.$store.state.sessionData
            ? this.$store.state.sessionData.session_id
            : "",
          this.userInformation.phone,
          this.getBatch,
          "" // date of birth
        );

        // Post user session activity
        if (this.$store.state.sessionData.session_id != null) {
          await UserAPI.postUserSessionActivity(
            userId,
            this.$store.state.sessionData.type,
            this.$store.state.sessionData.session_id,
            this.$store.state.authGroupData.input_schema.user_type,
            this.$store.state.sessionData.session_occurrence_id
          );
        }

        // Redirect to destination
        redirectToDestination(
          userId,
          this.$store.state.omrMode,
          this.$store.state.abTestId,
          this.$store.state.platform_id,
          this.$store.state.platform_link,
          this.$store.state.platform,
          this.$store.state.authGroupData.input_schema.user_type,
          this.$store.state.sessionData &&
            this.$store.state.sessionData.meta_data &&
            this.$store.state.sessionData.meta_data.test_type,
          this.$route.query.testType
        );
      } catch (error) {
        console.error("Complete phone authentication error:", error);
        this.displayOTPMessage = {
          message: "Authentication failed. Please try again.",
          status: "failure",
        };
      }
    },

    /** Start countdown timer for resend OTP */
    startResendTimer() {
      if (this.OTPInterval) {
        clearInterval(this.OTPInterval);
      }

      this.OTPInterval = setInterval(() => {
        if (this.resendOTPTimeLimit > 0) {
          this.resendOTPTimeLimit -= 1;
        } else {
          clearInterval(this.OTPInterval);
        }
      }, 1000);
    },

    /**
     * Performs authentication by validating the user and redirecting user only if valid.
     * @returns {Promise<void>} A Promise that resolves once the authentication process is complete.
     */
    async authenticate() {
      var TESTING_MODE = false;
      if (this.$store.state.authGroupData.name == "AFTesting") {
        TESTING_MODE = true;
        // authenticate all userIds as valid
        // do not send logs to afdb
      }

      let isUserValid = await validateUser(
        this.auth_type,
        this.userInformation,
        this.$store.state.authGroupData.input_schema.user_type,
        this.$store.state.authGroupData.id
      );

      if (TESTING_MODE == true) {
        isUserValid.isUserIdValid = true;
        isUserValid.isPhoneNumberValid = true; // temp
      }

      var userId = "";
      if (this.auth_type.includes("ID") && !isUserValid.isUserIdValid) {
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
      } else if (this.auth_type.includes("CODE") && !isUserValid.isCodeValid) {
        this.invalidLoginMessage =
          this.invalidLoginMessageTranslations["CODE"][this.locale];
      } else {
        if ("code" in this.userInformation) {
          userId = this.userInformation["code"];
        } else if ("teacher_id" in this.userInformation) {
          userId = this.userInformation["teacher_id"];
        } else if ("candidate_id" in this.userInformation) {
          userId = this.userInformation["candidate_id"];
        } else if ("phone" in this.userInformation) {
          userId = this.userInformation["phone"];
          this.phoneVerified = true;
          this.showOTPFlow = true;
          return; // Don't proceed with normal auth - wait for OTP verification
        } else {
          userId = this.userInformation["student_id"];
        }

        // create token only for gurukul
        if (this.$store.state.platform == "gurukul") {
          await TokenAPI.createAccessToken(
            userId,
            this.$store.state.authGroupData.name
          );
        }

        if (this.enable_popup) {
          if (
            this.$store.state.sessionData.session_id != null &&
            TESTING_MODE == false
          ) {
            await UserAPI.postUserSessionActivity(
              this.userInformation["student_id"],
              "sign-in",
              this.$store.state.sessionData.session_id,
              this.$store.state.authGroupData.input_schema.user_type,
              this.$store.state.sessionData.session_occurrence_id
            );
          }

          await sendSQSMessage(
            "sign-in",
            "", // deprecated sub_type
            this.$store.state.platform,
            this.$store.state.platform_id,
            this.userInformation["student_id"],
            this.auth_type.toString(),
            this.$store.state.authGroupData.name,
            this.$store.state.authGroupData.input_schema.user_type,
            this.$store.state.sessionData.session_id,
            "phone" in this.userInformation
              ? this.userInformation["phone"]
              : "",
            this.getBatch,
            "date_of_birth" in this.userInformation
              ? this.userInformation["date_of_birth"]
              : ""
          );
          this.$router.push({
            path: `/form/${this.userInformation["student_id"]}`,
            query: { sessionId: this.$store.state.sessionData.sessionId },
          });
        } else {
          if (
            this.$store.state.sessionData.session_id != null &&
            TESTING_MODE == false
          ) {
            // do not send logs for reports, gurukul, testing_mode
            await UserAPI.postUserSessionActivity(
              userId,
              this.$store.state.sessionData.type,
              this.$store.state.sessionData.session_id,
              this.$store.state.authGroupData.input_schema.user_type,
              this.$store.state.sessionData.session_occurrence_id
            );
          }
          await sendSQSMessage(
            "sessionData" in this.$store.state &&
              "type" in this.$store.state.sessionData
              ? this.$store.state.sessionData.type
              : "sign-in",
            "", // deprecated sub_type
            this.$store.state.platform,
            this.$store.state.platform_id,
            userId,
            this.auth_type.toString(),
            this.$store.state.authGroupData.name,
            this.$store.state.authGroupData.input_schema.user_type,
            "sessionData" in this.$store.state &&
              "session_id" in this.$store.state.sessionData
              ? this.$store.state.sessionData.session_id
              : "",
            "phone" in this.userInformation
              ? this.userInformation["phone"]
              : "",
            this.getBatch,
            "date_of_birth" in this.userInformation
              ? this.userInformation["date_of_birth"]
              : ""
          );
          redirectToDestination(
            userId,
            this.$store.state.omrMode,
            this.$store.state.abTestId,
            this.$store.state.platform_id,
            this.$store.state.platform_link,
            this.$store.state.platform,
            this.$store.state.authGroupData.input_schema.user_type,
            this.$store.state.sessionData &&
              this.$store.state.sessionData.meta_data &&
              this.$store.state.sessionData.meta_data.test_type,
            this.$route.query.testType
          );
        }
      }
    },

    /**
     * Redirects the user to the sign-up page with session context.
     */
    redirectToSignUp() {
      const query = {};

      // Include sessionId if available for better URL aesthetics and context
      if (this.$route.query.sessionId) {
        query.sessionId = this.$route.query.sessionId;
      }

      // Set type to signup to indicate the intended flow
      query.type = "signup";

      this.$router.push({
        name: "SignUp",
        query: query,
      });
    },
  },
};
</script>
<style>
text b {
  @apply underline;
}
</style>
