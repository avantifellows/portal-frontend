<template>
  <section>
    <div>
      <label>Enter your SRN / अपना SRN दर्ज करें</label>
      <div
        class="multipleStudentStyle"
        v-for="(input, index) in userIDList"
        :key="`IDInput-${index}`"
      >
        <input
          v-model="input.userID"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Your SRN / आपका SRN"
          required
          @keypress="isValidSRNFormat($event)"
          class="inputStyleClass"
          @input="updateValue($event, index)"
        />
        <div
          class="minus-sign"
          v-show="ifUserEnteredMoreThanOne"
          @click="removeField(index, userIDList)"
        ></div>
      </div>

      <span class="errorStyleClass" v-if="invalidInputMessage">{{
        invalidInputMessage
      }}</span>
      <span class="errorStyleClass" v-if="!isUserValid && validateCount == 1">{{
        invalidLoginMessage
      }}</span>

      <div class="flex flex-row my-auto multiple-div" v-if="isUserValidated">
        <button @click="addField(userIDList)" class="addButtonStyleClass">
          <div class="plus-sign mr-3" @click="addField(index, userIDList)"></div>
          Add another SRN / एक और SRN दर्ज करें
        </button>
      </div>
      <button
        @click="processForm"
        class="buttonStyleClass"
        :disabled="isSubmitButtonDisabled"
      >
        SUBMIT / जमा करें
      </button>
    </div>
  </section>
</template>

<script>
import { validateSRN } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";
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
    };
  },
  computed: {
    isAnyUserIDPresent() {
      //checks if any userID has been typed
      return (
        this.userIDList != null &&
        this.userIDList != undefined &&
        this.userIDList.length > 0 &&
        this.userIDList[0]["userID"] != ""
      );
    },
    ifUserEnteredMoreThanOne() {
      //used when multiple SRN's will be allowed to typed
      return !this.isSingleEntryOnly && this.userIDList.length > 1;
    },
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
    isSubmitButtonDisabled() {
      //submit button is disabled if no SRN has been typed or input is invalid or SRN hasn't been completely typed
      return (
        !this.isAnyUserIDPresent ||
        this.invalidInputMessage != "" ||
        this.userIDList.slice(-1)[0]["userID"].length < this.maxLengthOfSRN - 1
      );
    },
    isUserValidated() {
      //if multiple SRN's are allowed, then this helps with the activation of the + button, to add more SRN's
      return (
        !this.isSingleEntryOnly &&
        this.userIDList.slice(-1)[0]["userID"].length > this.maxLengthOfSRN - 1 &&
        this.userIDList.length < 10
      );
    },
  },
  methods: {
    isValidSRNFormat(e) {
      //checking to see if each char typed by user is only a number
      if (e.keyCode >= 48 && e.keyCode <= 57) return true;
      else e.preventDefault();
    },
    async addField(list) {
      //for adding another field, the previously entered ID is validated against the database
      const userID = parseInt(this.userIDList.slice(-1)[0]["userID"]);
      if (!isNaN(userID)) {
        await this.authenticateSRN(userID);
        //only if the SRN is valid or if the user is entering a SRN for the second time,the loop is entered
        if (this.isUserValid || this.validateCount > 1) {
          //setting the flag of the SRN
          this.userIDList.slice(-1)[0]["valid"] = this.isUserValid;
          list.push({ userID: "", valid: false });
          //resetting flags to default for processing next SRN
          this.isUserValid = false;
          this.validateCount = 0;
        }
      }
    },
    removeField(index, list) {
      //resetting all messages to default before deleting the input field
      this.invalidInputMessage = "";
      this.invalidLoginMessage = "";
      //edge case: user enters an invalid SRN. Error message is displayed. The user is given another chance. User adds another input field but decided to remove it.
      // At this point, the variables are reset. So the previously entered SRN is checked again, which should not happen. so setting this validateCount = 2 will bypass this.
      //Will not affect any other case. The user can either submit or decide to add another field again.
      this.validateCount = 2;
      list.splice(index, 1);
    },
    updateValue(event, index) {
      //checks if the 10 characters are entered
      if (event.target.value.length < this.maxLengthOfSRN) {
        this.invalidInputMessage = "Please type 10 numbers / कृपया १० संख्या टाइप करें";
        this.invalidLoginMessage = "";
      } else {
        this.invalidInputMessage = "";
      }
      //if more than 10 characters are entered, slicing the input to only 10
      // index tells us which input field is being considered
      if (event.target.value.length > this.maxLengthOfSRN) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfSRN);
        this.userIDList[index]["userID"] = event.target.value;
      }
    },
    //method that authentiates the SRN
    async authenticateSRN(userID) {
      //invokes the validation function
      let userIsValidated = await validateSRN(
        userID,
        this.validateCount,
        this.isSingleEntryOnly,
        this.redirectID,
        this.isUserValid,
        this.purpose,
        this.purposeParams,
        this.redirectTo
      );
      this.isUserValid = userIsValidated.isUserValid;
      this.validateCount = userIsValidated.validateCount;
      this.invalidLoginMessage = userIsValidated.invalidLoginMessage;
    },
    //method called after clicking the submit button
    async processForm() {
      var authType = "SRN";
      //if only one SRN is entered
      if (this.userIDList.length == 1) {
        //parsing the userID from user input
        let userID = parseInt(this.userIDList["0"]["userID"]);
        //invokes the validation function
        await this.authenticateSRN(userID);
        //sets the valid flag for that SRN
        this.userIDList[0]["valid"] = this.isUserValid;
      } else {
        //all previously typed SRN's will be authenticated through the addField method.
        // The last SRN will be authenticated after Submit button is clicked
        let last = this.userIDList.slice(-1);
        let userID = parseInt(last[0]["userID"]);
        if (!isNaN(userID)) {
          await this.authenticateSRN(userID);
          last[0]["valid"] = this.isUserValid;
        }
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
div {
  @apply flex flex-col mt-8;
}
label {
  @apply mb-2 mx-auto uppercase font-bold text-lg;
}
.inputStyleClass {
  @apply flex border py-2 mx-auto px-3 h-12;
}
.buttonStyleClass {
  @apply bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 rounded disabled:opacity-50;
}
.addButtonStyleClass {
  @apply bg-white flex flex-row mx-auto p-2;
}
.errorStyleClass {
  @apply mx-auto text-red-700 text-base mb-1;
}
.multipleStudentStyle {
  @apply flex flex-row w-1/2 md:w-1/6 lg:w-1/6  mx-auto;
}
.plus-sign {
  margin: auto;
  border: 1px solid;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  color: green;
  transition: color 0.25s;
  position: relative;
}
.plus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 15px;
  margin-left: -8px;
  margin-top: -2px;
  border-top: 4px solid;
}
.plus-sign::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  height: 15px;
  margin-left: -2px;
  margin-top: -8px;
  border-left: 4px solid;
}
.minus-sign {
  margin: auto;
  border: 1px solid;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  color: red;
  transition: color 0.25s;
  position: relative;
}
.minus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 15px;
  margin-left: -8px;
  margin-top: -2px;
  border-top: 4px solid;
}
</style>
