<template>
  <!-- loading spinner -->
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="require('@/assets/images/loading_spinner.svg')"
      ></inline-svg>
    </div>
  </div>

  <!-- main div -->
  <div
    class="flex flex-col my-auto h-full py-32 space-y-6"
    :class="{ 'opacity-20 pointer-events-none': isLoading }"
  >
    <!-- title -->
    <p
      class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl mx-auto font-bold px-6"
    >
      {{ inputBoxDisplayText }}
    </p>

    <!--text box to enter phone number-->
    <div
      class="flex flex-row justify-center"
      v-for="(phoneNumberObject, index) in phoneNumberList"
      :key="`idInput-${index}`"
    >
      <input
        v-model="phoneNumberObject.userID"
        :type="inputType"
        :inputmode="inputMode"
        pattern="[0-9]*"
        :placeholder="inputBoxPlaceholderText"
        required
        @keypress="isValidPhoneNumber($event)"
        class="border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
        :class="selectInputBoxClasses"
        @input="updatephoneNumber($event)"
      />
    </div>

    <!-- invalid input message  -->
    <span
      class="mx-auto text-red-700 text-base mb-1 px-2"
      v-if="isInvalidInputMessageShown"
      >{{ invalidInputMessage }}</span
    >

    <!--text box to enter OTP-->
    <div class="flex flex-col justify-center" v-if="isOTPSent">
      <p
        class="text-md sm:text-l md:text-l lg:text-xl xl:text-2xl mx-auto font-bold px-6"
      >
        {{ enterOTPInputBoxDisplayText }}
      </p>
      <input
        v-model="OTPCode"
        class="border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
      />
    </div>

    <!-- button to request for OTP -->
    <button
      @click="sendOTP"
      class="bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 disabled:opacity-50"
      :disabled="isRequestOTPButtonDisabled"
      v-show="!isOTPSent"
    >
      {{ requestOTPButtonDisplayText }}
    </button>

    <!-- OTP response message  -->
    <span class="mx-auto text-red-700 text-base mb-1 px-4" v-if="displayOTPMessage">{{
      displayOTPMessage
    }}</span>

    <!-- submit button -->
    <button
      v-show="isOTPSent"
      @click="verifyOTP"
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 mt-4 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
    >
      {{ submitButtonDisplayText }}
    </button>
  </div>
</template>

<script>
import { validateID } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";
import OTPAuth from "@/services/API/otp";
import {
  mapVerifyStatusCodeToMessage,
  mapSendStatusCodeToMessage,
} from "@/services/OTPCodes.js";

export default {
  name: "OTP",
  props: {
    redirectTo: String,
    redirectID: String,
    purpose: String,
    purposeParams: String,
    programData: Object,
    program: String,
    authType: String,
  },
  data() {
    return {
      phoneNumberList: [{ userID: "", valid: false }], // contains the phone number entered by the user
      isUserValid: false, // whether the user exists in our database
      isOTPSent: false, // has the OTP been sent
      OTPCode: "", // string that contains the OTP code entered by the user
      isLoading: false,
      displayOTPMessage: "", // string that contains any messages returned by the OTP service
      invalidInputMessage: null, // whether the input being entered by the user matches the basic validation criteria
    };
  },

  computed: {
    phoneNumber() {
      return this.phoneNumberList["0"]["userID"];
    },

    /** Returns the input mode stored against the program */
    inputMode() {
      return this.programData.input.mode;
    },

    /** Returns the input type stored against the program */
    inputType() {
      return this.programData.input.type;
    },

    /** Returns the placeholder text, stored against the program, for the phone number input box. */
    inputBoxPlaceholderText() {
      return this.programData.text.default.placeholder;
    },

    /** Checks if any phoneNumber has been entered */
    isAnyphoneNumberPresent() {
      return this.phoneNumberList != undefined && this.phoneNumber != "";
    },

    /** Whether the 'Request OTP' button should be disabled */
    isRequestOTPButtonDisabled() {
      return (
        this.phoneNumber == undefined ||
        this.invalidInputMessage != "" ||
        this.isOTPSent == true
      );
    },

    /**
     * Whether the submit button is disabled
     * Returns true if any of the following conditions are met:
     * - if 'Request OTP' button is enabled
     * - if OTP hasn't been typed yet
     */
    isSubmitButtonDisabled() {
      return !(this.isRequestOTPButtonDisabled || this.OTPCode.length > 0);
    },

    /** Checks if the current input entry has the required number of characters */
    isCurrentEntryIncomplete() {
      return this.phoneNumber.length < this.maxLengthOfId;
    },

    /** Whether input being typed is in the correct format */
    isInvalidInputMessageShown() {
      return this.invalidInputMessage != null;
    },

    /** Returns the title text for the input box */
    inputBoxDisplayText() {
      return this.programData.text.default.display;
    },

    /** Returns the text for the OTP code input box */
    enterOTPInputBoxDisplayText() {
      return this.programData.text.default.enterOTP;
    },

    /** Returns the text for the button to request an OTP */
    requestOTPButtonDisplayText() {
      return this.programData.text.default.requestOTP;
    },

    /** Returns the text for the submit button */
    submitButtonDisplayText() {
      return this.programData.text.default.submitButton;
    },

    /** Returns the maximum length of the ID */
    maxLengthOfId() {
      return this.programData.input.maxLengthOfId;
    },

    /** Returns the basic validation type for the input */
    basicValidationType() {
      return this.programData.input.basicValidationType;
    },

    /** Returns the invalid input message stored against each program */
    invalidInputText() {
      return this.programData.text.default.invalid.input;
    },
  },
  methods: {
    /** Determines how the input box should look.
     * - If an input error needs to be displayed, the box has a a red border.
     * - Otherwise, it has an opacity of 30.
     */
    selectInputBoxClasses() {
      let baseStyle =
        "border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none";
      return this.invalidInputMessage
        ? baseStyle + "border-red-600 focus:border-red-600"
        : baseStyle + "pointer-events-none opacity-30";
    },

    /** Calls the mapping function to validate the typed character
     * @param {Object} event - event triggered when a character is typed
     */
    isValidPhoneNumber(event) {
      if (validationTypeToFunctionMap[this.basicValidationType](event)) {
        return true;
      } else event.preventDefault();
    },

    /** Resets the invalid input message */
    resetInvalidInputMessage() {
      this.invalidInputMessage = "";
    },

    /** This function is called whenever something is entered in the input box.
     * It checks if the required number of characters are being typed.
     * @param {Object} event - the event which triggered this function
     */
    updatephoneNumber(event) {
      if (event.target.value.length == 0) {
        this.invalidInputMessage = "";
      } else if (event.target.value.length > this.maxLengthOfId) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfId);
        this.phoneNumber = event.target.value.toString();
      } else if (event.target.value.length < this.maxLengthOfId) {
        this.invalidInputMessage = this.invalidInputText;
      } else {
        this.resetInvalidInputMessage();
      }
    },

    /** Function that calls the API to send an OTP
     * If the status is 200, the OTP has been sent.
     * Otherwise, retry
     */
    async sendOTP() {
      const response = await OTPAuth.sendOTP(parseInt(this.phoneNumber));
      if (response.status == 200) {
        this.displayOTPMessage = mapSendStatusCodeToMessage(response.status.toString());
        this.isOTPSent = true;
      } else {
        this.displayOTPMessage = mapSendStatusCodeToMessage(response.status.toString());
        this.isOTPSent = false;
      }
    },

    /** Function that verifies the OTP */
    async verifyOTP() {
      const response = await OTPAuth.verifyOTP(
        parseInt(this.phoneNumber),
        parseInt(this.OTPCode)
      );
      this.displayOTPMessage = mapVerifyStatusCodeToMessage[response.status.toString()];
      if (response.status == 200) {
        this.isLoading = true;
        this.authenticateAndRedirect();
      }
    },

    /** This method authenticates the phone number.
     */
    async authenticatePhoneNumber() {
      this.isLoading = true;
      this.phoneNumberList[0]["valid"] = await validateID(
        this.phoneNumber,
        this.programData.dataSource,
        this.authType,
        this.validateCount
      );
      this.isLoading = false;
    },

    /** Method called when submit button is clicked. Calls method to authenticate phone number.
     * Also, redirects user to the destination and sends a SQS message.
     */
    async authenticateAndRedirect() {
      if (
        redirectToDestination(
          this.purposeParams,
          this.phoneNumberList,
          this.redirectID,
          this.redirectTo,
          this.authType,
          this.program
        )
      ) {
        this.isLoading = false;
        this.authenticatePhoneNumber();
        sendSQSMessage(
          this.purpose,
          this.purposeParams,
          this.redirectTo,
          this.redirectID,
          this.phoneNumberList,
          this.authType,
          this.program
        );
      }
    },
  },
};
</script>

<style lang="postcss">
.btn {
  border-bottom: outset;
}
.btn:active {
  border-bottom: unset;
}
</style>
