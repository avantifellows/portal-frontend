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
    <p class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl mx-auto font-bold">
      {{ programData["text"]["default"]["display"] }}
    </p>
    <!--text box to enter phone number-->

    <div class="flex flex-row justify-center">
      <input
        v-model="userId"
        :type="inputType"
        :inputmode="inputMode"
        pattern="[0-9]*"
        :placeholder="placeholderText"
        required
        @keypress="isValidEntry($event)"
        class="border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
        :class="calculateInputClasses"
        @input="updateUserId($event, index)"
      />
    </div>

    <!-- invalid input and login message  -->
    <span class="mx-auto text-red-700 text-base mb-1" v-if="isInvalidInputMessageShown">{{
      invalidInputMessage
    }}</span>

    <!--text box to enter OTP-->
    <div class="flex flex-col justify-center" v-if="isOTPRequested">
      <p class="text-md sm:text-l md:text-l lg:text-xl xl:text-2xl mx-auto font-bold">
        {{ programData["text"]["default"]["enterOTP"] }}
      </p>
      <input
        v-model="OTPCode"
        class="border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
      />
    </div>

    <!-- button to request for OTP -->
    <button
      @click="requestOTP"
      class="bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 rounded-3xl border-2 disabled:opacity-50"
      :disabled="isRequestOTPButtonDisabled"
      v-show="!isOTPRequested"
    >
      {{ programData["text"]["default"]["requestOTP"] }}
    </button>
    <!-- invalid input message  -->
    <span class="mx-auto text-red-700 text-base mb-1" v-if="displayOTPMessage">{{
      displayOTPMessage
    }}</span>
    <!-- button to request resending OTP -->
    <div v-if="isOTPRequested && !resentOtp" class="flex flex-row justify-center">
      <p class="pr-7">{{ programData["text"]["default"]["receiveError"] }}</p>
    </div>

    <!-- submit button -->
    <button
      v-show="isOTPRequested"
      @click="verifyOTP"
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 mt-4 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
    >
      {{ programData["text"]["default"]["submitButton"] }}
    </button>
  </div>
</template>

<script>
import { validateID } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";
import OTPAuth from "@/services/API/otp";

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
      userId: "",
      isUserValid: false, // whether the user exists in the backend database
      isOTPRequested: false,
      OTPCode: "",
      isLoading: false,
      resentOtp: false,
      displayOTPMessage: "",
      invalidInputMessage: null,
      mapCodeToMessage: {
        311: "This OTP does not exist",
        309: "You have exceeded maximum number of attempts. Please try after sometime.",
        301: "OTP token is expired.",
        310: "This OTP is incorrect.",
        308: "You are re-trying too early. Please wait for sometime.",
      },
    };
  },

  computed: {
    /** Returns the input mode stored against the program */
    inputMode() {
      return this.programData["input"]["mode"];
    },
    /** Returns the input type stored against the program */
    inputType() {
      return this.programData["input"]["type"];
    },
    /** Returns the placeholder text stored against the program */
    placeholderText() {
      return this.programData["text"]["default"]["placeholder"];
    },
    /** Checks if any userID has been entered */
    isAnyUserIDPresent() {
      return this.userId != undefined && this.userId != "";
    },
    isRequestOTPButtonDisabled() {
      return (
        this.userId == undefined ||
        this.invalidInputMessage != "" ||
        this.isOTPRequested == true
      );
    },
    /**
     * Whether the submit button is disabled
     * Returns true if any of the following conditions are met:
     * - no ID has been entered
     * - input is invalid
     * - ID hasn't been completely entered
     */
    isSubmitButtonDisabled() {
      return !(this.isRequestOTPButtonDisabled || this.OTPCode.length > 0);
    },
    /** Checks if the current input entry has the required number of characters */
    isCurrentEntryIncomplete() {
      return this.userId.length < this.programData["input"]["maxLengthOfId"];
    },
    /** Whether input being typed is in the correct format */
    isInvalidInputMessageShown() {
      return this.invalidInputMessage != null;
    },
  },
  methods: {
    /** Determines how the input box should look.
     * @param {Number} index - index of the input box
     */
    calculateInputClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidInputMessage,
          "pointer-events-none opacity-30": !this.invalidInputMessage,
        },
      ];
    },
    /** Calls the mapping function to validate the typed character
     * @param {Object} event - event triggered when a character is typed
     */
    isValidEntry(event) {
      if (
        validationTypeToFunctionMap[this.programData["input"]["basicValidationType"]](
          event
        )
      ) {
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
     * @param {Number} index - the index of the input field
     */
    updateUserId(event) {
      if (event.target.value.length == 0) {
        this.invalidInputMessage = "";
      } else if (event.target.value.length < this.programData["input"]["maxLengthOfId"]) {
        this.invalidInputMessage = this.programData["text"]["default"]["invalid"][
          "input"
        ];
      } else {
        this.resetInvalidInputMessage();
      }
      if (event.target.value.length > this.programData["input"]["maxLengthOfId"]) {
        event.target.value = event.target.value.slice(
          0,
          this.programData["input"]["maxLengthOfId"]
        );
        this.userId = event.target.value.toString();
      }
    },
    async requestOTP() {
      const response = await OTPAuth.sendOTP(parseInt(this.userId));
      if (response.status == 200) {
        this.displayOTPMessage = "OTP sent!";
      }
      this.isOTPRequested = true;
    },
    async verifyOTP() {
      const response = await OTPAuth.verifyOTP(
        parseInt(this.userId),
        parseInt(this.OTPCode)
      );
      this.displayOTPMessage = this.mapCodeToMessage[response.status.toString()];
      if (response.status == 200) {
        this.authenticate();
      }
    },
    /** This method authenticates the  ID.
     * @param {String} userID - most recent ID
     */
    async authenticatePhoneNumber() {
      this.isLoading = true;
      this.isUserValid = await validateID(
        this.userID,
        this.validateCount,
        this.programData["dataSource"]["name"],
        this.programData["dataSource"]["column"],
        this.authType
      );
      this.isLoading = false;
    },

    /** Authenticates the last entry typed before the submit button is clicked.
     * Also, redirects user to the destination and sends a SQS message.
     */
    async authenticate() {
      if (
        redirectToDestination(
          this.purposeParams,
          this.userId,
          this.redirectID,
          this.redirectTo,
          this.authType
        )
      ) {
        this.authenticatePhoneNumber();
        sendSQSMessage(
          this.purpose,
          this.purposeParams,
          this.redirectTo,
          this.redirectID,
          this.userIDList,
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
