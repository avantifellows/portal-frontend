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
      Enter your SRN / अपना SRN दर्ज करें
    </p>
    <!-- input options and delete options icon -->
    <div
      class="flex flex-row justify-center"
      v-for="(input, index) in userIDList"
      :key="`IDInput-${index}`"
      :class="{ 'pl-12': hasUserEnteredMoreThanOne }"
    >
      <div>
        <input
          v-model="input.userID"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Your SRN / आपका SRN"
          required
          @keypress="isValidNumericEntry($event)"
          class="border-2 rounded-sm p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
          :class="calculateInputClasses(index)"
          @input="updateUserId($event, index)"
        />
      </div>

      <div class="my-auto px-3" v-show="hasUserEnteredMoreThanOne">
        <button @click="deleteInputBox(index, userIDList)">
          <inline-svg
            class="fill-current text-red-600 h-8 w-8"
            :src="require('@/assets/images/remove_circle.svg')"
          ></inline-svg>
        </button>
      </div>
    </div>

    <!-- invalid input and login message  -->
    <span class="mx-auto text-red-700 text-base mb-1" v-if="isInvalidInputMessageShown">{{
      invalidInputMessage
    }}</span>
    <span class="mx-auto text-red-700 text-base mb-1" v-if="isInvalidLoginMessageShown">{{
      invalidLoginMessage
    }}</span>
    <!-- add srn button -->
    <div class="my-auto" v-if="isAddButtonAllowed">
      <button
        @click="addField"
        class="flex flex-row mx-auto p-2 items-center border-2 rounded-xl bg-gray-200 btn"
      >
        <inline-svg
          class="fill-current text-green-600 h-10 w-10 pr-1"
          :src="require('@/assets/images/add_circle.svg')"
        ></inline-svg>
        <div class="border-l-2 border-gray-500 pl-3">
          <p class="leading-tight">
            Add another SRN <br />
            एक और SRN दर्ज करें
          </p>
        </div>
      </button>
    </div>
    <!-- submit button -->
    <button
      @click="authenticate"
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 mt-4 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
    >
      SUBMIT / जमा करें
    </button>
  </div>
</template>

<script>
import { validateSRN } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";

const NUMBER_OF_INPUTS_ALLOWED = 10;
const authType = "SRN";

export default {
  name: "SRNEntry",
  props: {
    redirectTo: String,
    redirectID: String,
    purpose: String,
    purposeParams: String,
  },
  data() {
    return {
      userIDList: [{ userID: "", valid: false }], //array containing user-ids and a valid flag for each
      invalidInputMessage: null, // whether the input is in correct format
      isCurrentUserValid: false, // whether the current user is valid
      maxLengthOfSRN: 10,
      validateCount: 0, // count the number of times the user has been validated
      invalidLoginMessage: "Please enter correct SRN / कृपया सही SRN दर्ज करें",
      isLoading: false,
    };
  },
  computed: {
    /** Returns length of the list of user IDs */
    numOfUserIds() {
      return this.userIDList.length;
    },
    /** Checks if any userID has been entered */
    isAnyUserIDPresent() {
      return (
        this.userIDList != undefined &&
        this.numOfUserIds > 0 &&
        this.userIDList[0]["userID"] != ""
      );
    },
    /** Whether multiple entries have been made by the user */
    hasUserEnteredMoreThanOne() {
      return !this.isSingleEntryOnly && this.numOfUserIds > 1;
    },
    /** Whether only a single entry is allowed.
     * For now, plio does not support multiple input entries */
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
    /**
     * Whether the submit button is disabled
     * Returns true if any of the following conditions are met:
     * - no SRN has been typed
     * - input is invalid
     * - SRN hasn't been completely typed
     */
    isSubmitButtonDisabled() {
      return (
        !this.isAnyUserIDPresent ||
        this.invalidInputMessage != "" ||
        this.isCurrentEntryIncomplete
      );
    },
    /**
     * Checks if "+" button should be displayed. Will be activated only if:
     * - multiple entries are allowed
     * - if current input entry is complete
     * - if cap of maximum entries hasn't been reached yet
     */
    isAddButtonAllowed() {
      return (
        !this.isSingleEntryOnly &&
        !this.isCurrentEntryIncomplete &&
        this.numOfUserIds < NUMBER_OF_INPUTS_ALLOWED
      );
    },
    /** Checks if the current input entry has the required number of characters */
    isCurrentEntryIncomplete() {
      return this.latestEntry["userID"].length < this.maxLengthOfSRN;
    },
    /** Returns the most recently entered input */
    latestEntry() {
      return this.userIDList.slice(-1)[0];
    },
    /** Whether the current typed ID is valid */
    isInvalidLoginMessageShown() {
      return !this.isCurrentUserValid && this.validateCount == 1;
    },
    /** Whether input being typed is in the correct format */
    isInvalidInputMessageShown() {
      return this.invalidInputMessage == null;
    },
  },
  methods: {
    /** Determines how the input box should look.
     * @param {Number} index - index of the input box
     */
    calculateInputClasses(index) {
      return [
        {
          "border-red-600 focus:border-red-600":
            this.invalidInputMessage && index == this.numOfUserIds - 1,
          "pointer-events-none opacity-30": index < this.numOfUserIds - 1,
        },
      ];
    },
    /** Checks to see if the input character is a number. Makes use of ASCII values.
     * @param {Object} event - event triggered when a character is typed
     */
    isValidNumericEntry(event) {
      if (event.keyCode >= 48 && event.keyCode <= 57) return true;
      else event.preventDefault();
    },
    /** Adds a new object to the userIDList array */
    addNewEmptyField() {
      this.userIDList.push({ userID: "", valid: false });
    },
    /** Removes an element in the array at a given index.
     * @param {Number} index - the index of the input box where "-" button is clicked
     */
    removeInputField(index) {
      this.userIDList.splice(index, 1);
    },
    /** Resets the invalid input message */
    resetInvalidInputMessage() {
      this.invalidInputMessage = "";
    },
    /** Resets the invalid login message */
    resetInvalidLoginMessage() {
      this.invalidLoginMessage = "";
    },
    /** Sets the temp valid flag to false (default) for authentication of a possible next user */
    resetValidFlag() {
      this.isCurrentUserValid = false;
    },
    /** Sets the valid key of the latest user to the value of the temp flag. The temp flag contains the value returned by the backend */
    setValidFlag() {
      this.latestEntry["valid"] = this.isCurrentUserValid;
    },
    /** Resets the userID key of an element in the array at a particular index */
    resetEntry(index) {
      this.userIDList[index]["userID"] = "";
    },
    /** This function is called whenever the "+" button is clicked.
     * Authenticates the most recent typed entry against the database.
     */
    async addField() {
      const latestUserID = parseInt(this.latestEntry["userID"]);
      await this.authenticateSRN(latestUserID);
      if (!this.isCurrentUserValid && this.validateCount == 1) {
        this.handleIncorrectEntry(latestUserID);
      }
      if (this.isCurrentUserValid || this.validateCount > 1) {
        this.setValidFlag();
        this.addNewEmptyField();
        this.resetValidFlag();
        this.validateCount = 0;
      }
    },
    /** This method is called whenever "-" button is clicked.
     * Removes the selected entry from the entry list and resets appropriate variables
     * @param {Number} index - index of input field to be removed
     */
    deleteInputBox(index) {
      this.resetInvalidInputMessage();
      this.resetInvalidLoginMessage();
      this.validateCount = 2;
      this.removeInputField(index);
    },

    /** This function is called whenever something is entered in the input box.
     * It checks if the required number of characters are being typed.
     * @param {Object} event - the event which triggered this function
     * @param {Number} index - the index of the input field
     */
    updateUserId(event, index) {
      if (event.target.value.length == 0) {
        this.invalidInputMessage = "";
      } else if (event.target.value.length < this.maxLengthOfSRN) {
        this.invalidInputMessage = "Please type 10 numbers / कृपया १० संख्या टाइप करें";
        this.resetInvalidLoginMessage();
      } else {
        this.resetInvalidInputMessage();
      }
      if (event.target.value.length > this.maxLengthOfSRN) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfSRN);
        this.userIDList[index]["userID"] = event.target.value.toString();
      }
    },
    /** This function handles all invalid/incorrect entries. An SQS message is sent to the queue in AWS.
     * @param {String} userID - ID of the incorrect entry field
     */
    handleIncorrectEntry(userID) {
      var purposeParams = "incorrect-entry";
      var tempUserIDList = [
        { userID: userID.toString(), valid: this.isCurrentUserValid },
      ];
      sendSQSMessage(
        this.purpose,
        purposeParams,
        this.redirectTo,
        this.redirectID,
        tempUserIDList,
        authType
      );
    },

    /** This method is called whenever "+" button is clicked. It authenticates the most recent typed ID.
     * @param {String} userID - most recent ID
     */
    async authenticateSRN(userID) {
      this.isLoading = true;
      let userValidationResponse = await validateSRN(userID, this.validateCount);
      this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
      this.validateCount = userValidationResponse.validateCount;
      this.invalidLoginMessage = userValidationResponse.invalidLoginMessage;
      this.isLoading = false;

      if (this.invalidLoginMessage != "") {
        this.resetEntry(this.numOfUserIds - 1);
      }
    },

    /** Authenticates the last entry typed before the submit button is clicked.
     * Also, redirects user to the destination and sends a SQS message.
     */
    async authenticate() {
      let latestUserID = parseInt(this.latestEntry["userID"]);
      await this.authenticateSRN(latestUserID);
      if (!this.isCurrentUserValid && this.validateCount == 1) {
        this.handleIncorrectEntry(latestUserID);
      }
      this.setValidFlag();

      if (this.isCurrentUserValid || this.validateCount > 1) {
        if (
          redirectToDestination(
            this.purposeParams,
            this.userIDList,
            this.redirectID,
            this.redirectTo,
            authType
          )
        ) {
          sendSQSMessage(
            this.purpose,
            this.purposeParams,
            this.redirectTo,
            this.redirectID,
            this.userIDList,
            authType
          );
        }
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
