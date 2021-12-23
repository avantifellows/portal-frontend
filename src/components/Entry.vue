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
    <!-- input options and delete options icon -->
    <div
      class="flex flex-row justify-center"
      v-for="(input, index) in userIDList"
      :key="`idInput-${index}`"
      :class="{ 'pl-12': hasUserEnteredMoreThanOne }"
    >
      <div>
        <input
          v-model="input.userID"
          :type="inputType"
          :inputmode="inputMode"
          pattern="[0-9]*"
          :placeholder="placeholderText"
          required
          @keypress="isValidEntry($event)"
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
    <!-- button to add another input -->
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
            {{ programData["text"]["default"]["addButton"] }}
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
      {{ programData["text"]["default"]["submitButton"] }}
    </button>
  </div>
</template>

<script>
import { validateID } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "Entry",
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
      userIDList: [{ userID: "", valid: false }], //array containing user-ids and a valid flag for each
      isCurrentUserValid: false, // whether the current user is valid
      validateCount: 0, // count the number of times the user has been validated
      invalidLoginMessage: "",
      isLoading: false,
      invalidInputMessage: null,
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
      return !this.isMultipleIDEntryAllowed && this.numOfUserIds > 1;
    },
    /** Whether only a single entry is allowed.
     * For now, plio does not support multiple input entries */
    isMultipleIDEntryAllowed() {
      return this.redirectTo == "plio";
    },
    /**
     * Whether the submit button is disabled
     * Returns true if any of the following conditions are met:
     * - no ID has been entered
     * - input is invalid
     * - ID hasn't been completely entered
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
        !this.isMultipleIDEntryAllowed &&
        !this.isCurrentEntryIncomplete &&
        this.numOfUserIds < this.programData["maxNumberOfIds"]
      );
    },
    /** Checks if the current input entry has the required number of characters */
    isCurrentEntryIncomplete() {
      return (
        this.latestEntry["userID"].length < this.programData["input"]["maxLengthOfId"]
      );
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
      return this.invalidInputMessage != null;
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
      await this.authenticateID(latestUserID);
      if (!this.isCurrentUserValid && this.validateCount == 1) {
        this.handleIncorrectEntry(latestUserID);
      }
      if (this.isCurrentUserValid || this.validateCount > 1) {
        this.setValidFlag();
        this.addNewEmptyField();
        this.resetValidFlag();
        this.resetInvalidLoginMessage();
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
      } else if (event.target.value.length < this.programData["input"]["maxLengthOfId"]) {
        this.invalidInputMessage = this.programData["text"]["default"]["invalid"][
          "input"
        ];
        this.resetInvalidLoginMessage();
      } else {
        this.resetInvalidInputMessage();
      }
      if (event.target.value.length > this.programData["input"]["maxLengthOfId"]) {
        event.target.value = event.target.value.slice(
          0,
          this.programData["input"]["maxLengthOfId"]
        );
        this.userIDList[index]["userID"] = event.target.value.toString();
      }
    },
    /** This function handles all invalid/incorrect entries. An SQS message is sent to the queue in AWS.
     * @param {String} userID - ID of the incorrect entry field
     */
    handleIncorrectEntry(userID) {
      let purposeParams = "incorrect-entry";
      let tempUserIDList = [
        { userID: userID.toString(), valid: this.isCurrentUserValid },
      ];
      sendSQSMessage(
        this.purpose,
        purposeParams,
        this.redirectTo,
        this.redirectID,
        tempUserIDList,
        this.authType
      );
    },

    /** This method is called whenever "+" button is clicked. It authenticates the most recent typed ID.
     * @param {String} userID - most recent ID
     */
    async authenticateID(userID) {
      this.isLoading = true;
      let userValidationResponse = await validateID(
        userID,
        this.validateCount,
        this.programData["dataSource"]["name"],
        this.programData["dataSource"]["column"],
        this.programData["dataSource"]["type"]
      );
      this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
      this.validateCount = userValidationResponse.validateCount;
      this.isLoading = false;

      if (this.validateCount == 1) {
        this.invalidLoginMessage = this.programData["text"]["default"]["invalid"][
          "login"
        ];
      }
      if (this.invalidLoginMessage != "") {
        this.resetEntry(this.numOfUserIds - 1);
      }
    },

    /** Authenticates the last entry typed before the submit button is clicked.
     * Also, redirects user to the destination and sends a SQS message.
     */
    async authenticate() {
      let latestUserID = parseInt(this.latestEntry["userID"]);
      await this.authenticateID(latestUserID);
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
            this.authType
          )
        ) {
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