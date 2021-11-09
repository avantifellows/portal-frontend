<template>
  <!-- loading spinner -->
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <span class="material-icons text-black text-4xl m-auto animate-spin">
        autorenew
      </span>
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
      :class="{ 'pl-12': ifUserEnteredMoreThanOne }"
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
          :class="calculateInputboxStyleClasses(index)"
          @input="updateValue($event, index)"
        />
      </div>

      <div class="my-auto px-3" v-show="ifUserEnteredMoreThanOne">
        <button
          class="material-icons text-red-500"
          @click="removeField(index, userIDList)"
        >
          remove_circle
        </button>
      </div>
    </div>

    <!-- invalid input and login message  -->
    <span class="mx-auto text-red-700 text-base mb-1" v-if="invalidInputMessage">{{
      invalidInputMessage
    }}</span>
    <span
      class="mx-auto text-red-700 text-base mb-1"
      v-if="!isCurrentUserValid && validateCount == 1"
      >{{ invalidLoginMessage }}</span
    >
    <!-- add srn button -->
    <div class="my-auto" v-if="isAddButtonAllowed">
      <button
        @click="addField"
        class="flex flex-row mx-auto p-2 items-center border-2 rounded-xl bg-gray-200 btn"
      >
        <span class="material-icons text-green-500 text-4xl pr-2">
          add_circle_outline
        </span>
        <div class="border-l-2 border-gray-500 pl-4">
          <p class="leading-tight">
            Add another SRN <br />
            एक और SRN दर्ज करें
          </p>
        </div>
      </button>
    </div>
    <!-- submit button -->
    <button
      @click="processForm"
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

const numberOfSRNsAllowed = 10;
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
      userIDList: [{ userID: "", valid: false }], //array containing user-id's and a valid flag for each
      invalidInputMessage: null, //flag to check if the input is in correct format
      isCurrentUserValid: false, // whether the current user is valid
      maxLengthOfSRN: 10,
      validateCount: 0, //this variable tells us how many times the user has been validated.
      invalidLoginMessage: "Please enter correct SRN / कृपया सही SRN दर्ज करें",
      isLoading: false, 
    };
  },
  computed: {
    //returns length of the userID list
    userIdListLength() {
      return this.userIDList.length;
    },
    //checks if any userID has been typed
    isAnyUserIDPresent() {
      return (
        this.userIDList != undefined &&
        this.userIdListLength > 0 &&
        this.userIDList[0]["userID"] != ""
      );
    },
    //checks if multiple entries are allowed and if one entry is already inputted
    ifUserEnteredMoreThanOne() {
      return !this.isSingleEntryOnly && this.userIdListLength > 1;
    },
    //for now, plio does not support multiple input entries
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
    /* returns submit button as disabled if any of the following is true:
     - no SRN has been typed
     - input is invalid
     - SRN hasn't been completely typed */
    isSubmitButtonDisabled() {
      return (
        !this.isAnyUserIDPresent ||
        this.invalidInputMessage != "" ||
        this.isCurrentEntryIncomplete
      );
    },
    /* checks if + button should be displayed. Will be activated only if:
     - multiple entries are allowed
     - if current input entry is complete
     - if cap of maximum entries hasn't been reached yet */
    isAddButtonAllowed() {
      return (
        !this.isSingleEntryOnly &&
        !this.isCurrentEntryIncomplete &&
        this.userIdListLength < numberOfSRNsAllowed
      );
    },
    // checks if the current input entry has the required number of characters.
    isCurrentEntryIncomplete() {
      return this.getLatestEntry["userID"].length < this.maxLengthOfSRN;
    },
    // returns the most recent typed input entry
    getLatestEntry() {
      return this.userIDList.slice(-1)[0];
    },
  },
  methods: {
    /* determines how the input box should look like depending on which box it is. 
      - if the input box is the current one (i.e. being typed) and if the input is invalid (invalid input message is being displayed),
        then, the box has a border of red
      - if the input box is a past one (i.e. already typed), then the box is shown as unclickable 
      @param {Number} - index - index of the input box */
    calculateInputboxStyleClasses(index) {
      return [
        {
          "border-red-600 focus:border-red-600":
            this.invalidInputMessage && index == this.userIdListLength - 1,
          "pointer-events-none opacity-30": index < this.userIdListLength - 1,
        },
      ];
    },
    /* checks to see if the input character is a number. Makes use of ASCII values.
    @param {Event} - e - event triggered when a character is typed.  */
    isValidNumericEntry(e) {
      if (e.keyCode >= 48 && e.keyCode <= 57) return true;
      else e.preventDefault();
    },
    // adds a new dict to the array - userIDList
    addNewEmptyField() {
      this.userIDList.push({ userID: "", valid: false });
    },
    /* removes an element in the array at a given index. 
    @param {Number} - index - the index of the input box where - button is clicked. */
    removeInputField(index) {
      this.userIDList.splice(index, 1);
    },
    // sets the invalid input message to null (default)
    resetInvalidInputMessage() {
      this.invalidInputMessage = "";
    },
    // sets the invalid login message to null (default)
    resetInvalidLoginMessage() {
      this.invalidLoginMessage = "";
    },
    // sets the temp valid flag to false (default) for authentication of a possible next user
    resetValidFlag() {
      this.isCurrentUserValid = false;
    },
    // sets the valid key of the latest user to the value of the temp flag. The temp flag contains the value returned by the backend
    setValidFlag() {
      this.getLatestEntry["valid"] = this.isCurrentUserValid;
    },
    //resets the userID key of an element in the array at a particular index.
    resetEntry(index){
        this.userIDList[index]["userID"] = "";
    },
    /* this function is called whenever the + button is clicked. The most recent typed entry is authenticated against the database. 
    - if it does not exist and it is the first time being authenticated, handleIncorrectEntry() is called. 
    - if the entry exists or if it is being authenticated the second time, the 'valid' flag of the entry is set to whatever the value is returned by the backend. 
      Also, isCurrentUserValid and validateCount are reset to their default values, so that a possible next entry can be processed. */
    async addField() {
      const latestUserID = parseInt(this.getLatestEntry["userID"]);
      if (!isNaN(latestUserID)) {
        await this.authenticateSRN(latestUserID);
        if(!this.isCurrentUserValid && this.validateCount == 1){
          this.handleIncorrectEntry(latestUserID);
        }
        if (this.isCurrentUserValid || this.validateCount > 1) {
          this.setValidFlag();
          this.addNewEmptyField();
          this.resetValidFlag;
          this.validateCount = 0;
        }
      }
    },
    /* Before an element is removed from the userIDList array, the login message and input message are reset to default values. 
       removeInputField() is called to remove the element. 
       In most cases, this would be enough. But there is one edge case:
      Let's say the user typed in ID 'A' and decides to add another entry. This means 'A' is authenticated and it is valid/invalid. 
      The user types in the ID 'B' as the next entry and it is invalid. 
      The user changed their mind and decided to delete this entry ('B'). At this point, the variables will be in the following state:
        validateCount = 1
        isCurrentUserValid = false
      The state of the variables contradict the fact that 'A' is already authenticated. This means any of the two cases:
      - A is valid, so validateCount = 0 and isCurrentUserValid = true
      - A is invalid, so validateCount = 2 and isCurrentUserValid = false
      So when the user clicks submit, 'A' is authenticated again, which is a behaviour we do not want. So to bypass this, validateCount is set to 2. 
      (To better understand how this will help, understanding processForm() will help.) 
      isCurrentUserValid flag is ignored because the value is already set in each user's valid flag. 
      @params {Number} - index - index of input field to be removed */
    removeField(index) {
      this.resetInvalidInputMessage;
      this.resetInvalidLoginMessage;
      this.validateCount = 2;
      this.removeInputField(index);
    },
    /*  this function is called whenever something is entered in the input box. It checks if the required number of characters are being typed. 
    Until then, it prompts the user to type the required characters. 
    If the user types more than the desired number of characters, the input is sliced and the user wont be able to see the extra characters.
    @params {Event} - event - the event which triggered this function
    @params {Number} - index - the index of the input field */
    updateValue(event, index) {
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
    /* this functions handle all invalid/incorrect entries. An SQS message is sent with the following parameters:
    - purpose - from URL
    - purposeParams - "incorrect-entry"
    - redirectTo - from URL
    - redirectID - from URL
    - tempUserIDList - which contains only the ID of the incorrect entry
    - authType - from URL 
    @params {String} - userID - ID of the incorrect entry field */
    handleIncorrectEntry(userID){
        var purposeParams = "incorrect-entry"
        var tempUserIDList = [{userID: userID.toString(), valid: this.isCurrentUserValid}]
        sendSQSMessage(
            this.purpose,
            purposeParams,
            this.redirectTo,
            this.redirectID,
            tempUserIDList,
            authType
          );
    },
    /* this method is called whenever + button is clicked. It authenticates the most recent typed ID. 
    If the ID is invalid, then the login mesasge displays an error and the input field is cleared for the user to correct their entry.
    @params {String} - userID - most recent ID  */
    async authenticateSRN(userID) {
      this.isLoading = true;
      let userValidationResponse = await validateSRN(
        userID,
        this.validateCount,
        this.isSingleEntryOnly,
        this.redirectID,
        this.isCurrentUserValid,
        this.purpose,
        this.purposeParams,
        this.redirectTo
      );
      this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
      this.validateCount = userValidationResponse.validateCount;
      this.invalidLoginMessage = userValidationResponse.invalidLoginMessage;
      this.isLoading = false;

      if(this.invalidLoginMessage != ""){
        this.resetEntry(this.userIdListLength - 1)
      }
    },
    /* this method is called after the user clicks the submit button. Since all the ID's but the last are authenticated, this method calls authenticateSRN(). 
    If the user is invalid and is being authenticated the first time, handleIncorrectEntry() is called. 
    If the user is valid or is being authenticated the second time, the user is reidrected to their destination and an SQS message is sent. */
    async processForm() {
      let latestUserID = parseInt(this.getLatestEntry["userID"]);
      if (!isNaN(latestUserID)) {
        await this.authenticateSRN(latestUserID);
        if(!this.isCurrentUserValid && this.validateCount == 1){
        this.handleIncorrectEntry(latestUserID);
        }
        this.setValidFlag();
      }

      // either the user is valid or the user has been checked twice
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
