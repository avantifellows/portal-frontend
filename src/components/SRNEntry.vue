<template>
  <!-- loading spinner -->
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg class="text-black text-4xl m-auto animate-spin h-10 w-10"
          :src="require('@/assets/images/loading_spinner.svg')"></inline-svg>
    
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
          @click="removeField(index, userIDList)"
        >
          <inline-svg class="fill-current text-red-600 pt-2 pl-2 h-10 w-10"
          :src="require('@/assets/images/remove_circle.svg')"></inline-svg>
        </button>
      </div>
    </div>

    <!-- invalid input and login message  -->
    <span class="mx-auto text-red-700 text-base mb-1" v-if="invalidInputMessage">{{
      invalidInputMessage
    }}</span>
    <span
      class="mx-auto text-red-700 text-base mb-1"
      v-if="!isUserValid && validateCount == 1"
      >{{ invalidLoginMessage }}</span
    >
    <!-- add srn button -->
    <div class="my-auto" v-if="isAddButtonAllowed">
      <button
        @click="addField"
        class="flex flex-row mx-auto p-2 items-center border-2 rounded-xl bg-gray-200 btn"
      >
       <inline-svg class="fill-current text-green-600 pt-1 pl-1 h-10 w-10"
          :src="require('@/assets/images/add_circle.svg')"></inline-svg>
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
      isUserValid: false, // whether the user exists in the backend database
      maxLengthOfSRN: 10,
      validateCount: 0, //this variable tells us how many times the user has been validated.
      invalidLoginMessage: "Please enter correct SRN / कृपया सही SRN दर्ज करें",
      isLoading: false,
    };
  },
  computed: {
    userIdListLength() {
      return this.userIDList.length;
    },
    isAnyUserIDPresent() {
      //checks if any userID has been typed
      return (
        this.userIDList != undefined &&
        this.userIdListLength > 0 &&
        this.userIDList[0]["userID"] != ""
      );
    },
    ifUserEnteredMoreThanOne() {
      //used when multiple SRN's will be allowed to typed
      return !this.isSingleEntryOnly && this.userIdListLength > 1;
    },
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
    isSubmitButtonDisabled() {
      //submit button is disabled if no SRN has been typed or input is invalid or SRN hasn't been completely typed
      return (
        !this.isAnyUserIDPresent ||
        this.invalidInputMessage != "" ||
        this.isCurrentEntryIncomplete
      );
    },
    isAddButtonAllowed() {
      //if multiple SRN's are allowed, then this helps with the activation of the + button, to add more SRN's
      return (
        !this.isSingleEntryOnly &&
        !this.isCurrentEntryIncomplete &&
        this.userIdListLength < numberOfSRNsAllowed
      );
    },
    isCurrentEntryIncomplete() {
      return this.getLatestEntry["userID"].length < this.maxLengthOfSRN;
    },
    getLatestEntry() {
      return this.userIDList.slice(-1)[0];
    },
  },
  methods: {
    calculateInputboxStyleClasses(index) {
      return [
        {
          "border-red-600 focus:border-red-600":
            this.invalidInputMessage && index == this.userIdListLength - 1,
          "pointer-events-none opacity-30": index < this.userIdListLength - 1,
        },
      ];
    },
    isValidNumericEntry(e) {
      //checking to see if each char typed by user is only a number
      if (e.keyCode >= 48 && e.keyCode <= 57) return true;
      else e.preventDefault();
    },
    addNewEmptyField() {
      this.userIDList.push({ userID: "", valid: false });
    },
    removeInputField(index) {
      this.userIDList.splice(index, 1);
    },
    resetInvalidInputMessage() {
      this.invalidInputMessage = "";
    },
    resetInvalidLoginMessage() {
      this.invalidLoginMessage = "";
    },
    resetValidFlag() {
      this.isUserValid = false;
    },
    setValidFlag() {
      this.getLatestEntry["valid"] = this.isUserValid;
    },
    async addField() {
      //for adding another field, the previously entered ID is validated against the database
      const latestUserID = parseInt(this.getLatestEntry["userID"]);
      if (!isNaN(latestUserID)) {
        await this.authenticateSRN(latestUserID);
        //only if the SRN is valid or if the user is entering a SRN for the second time,the loop is entered
        if (this.isUserValid || this.validateCount > 1) {
          //setting the flag of the SRN
          this.setValidFlag();
          this.addNewEmptyField();
          //resetting flags to default for processing next SRN
          this.resetValidFlag;
          this.validateCount = 0;
        }
      }
    },
    removeField(index) {
      //resetting all messages to default before deleting the input field
      this.resetInvalidInputMessage;
      this.resetInvalidLoginMessage;
      //edge case: user enters an invalid SRN. Error message is displayed. The user is given another chance. User adds another input field but decided to remove it.
      // At this point, the variables are reset. So the previously entered SRN is checked again, which should not happen. so setting this validateCount = 2 will bypass this.
      //Will not affect any other case. The user can either submit or decide to add another field again.
      this.validateCount = 2;
      this.removeInputField(index);
    },
    updateValue(event, index) {
      //checks if the 10 characters are entered
      if (event.target.value.length == 0) {
        this.invalidInputMessage = "";
      } else if (event.target.value.length < this.maxLengthOfSRN) {
        this.invalidInputMessage = "Please type 10 numbers / कृपया १० संख्या टाइप करें";
        this.resetInvalidLoginMessage();
      } else {
        this.resetInvalidInputMessage();
      }
      //if more than 10 characters are entered, slicing the input to only 10
      // index tells us which input field is being considered
      if (event.target.value.length > this.maxLengthOfSRN) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfSRN);
        this.userIDList[index]["userID"] = event.target.value.toString();
      }
    },
    //method that authentiates the SRN
    async authenticateSRN(userID) {
      this.isLoading = true;
      //invokes the validation function
      let userValidationResponse = await validateSRN(
        userID,
        this.validateCount,
        this.isSingleEntryOnly,
        this.redirectID,
        this.isUserValid,
        this.purpose,
        this.purposeParams,
        this.redirectTo
      );
      this.isUserValid = userValidationResponse.isUserValid;
      this.validateCount = userValidationResponse.validateCount;
      this.invalidLoginMessage = userValidationResponse.invalidLoginMessage;
      this.isLoading = false;
    },
    //method called after clicking the submit button
    async processForm() {
      var authType = "SRN";

      //all previously typed SRN's will be authenticated through the addField method.
      // The last SRN will be authenticated after Submit button is clicked
      // (will work even for single entry as the first entry can be also considered as the last entry)
      let latestUserID = parseInt(this.getLatestEntry["userID"]);
      if (!isNaN(latestUserID)) {
        await this.authenticateSRN(latestUserID);
        this.setValidFlag();
      }

      // either the user is valid or the user has been checked twice
      if (this.isUserValid || this.validateCount > 1) {
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
