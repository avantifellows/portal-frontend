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
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Your SRN / आपका SRN"
          required
          @keypress="isValidSRNFormat($event)"
          class="inputStyleClass"
          @input="updateValue"
        />

        <div class="flex flex-row my-auto multiple-div" v-if="isUserValidated">
          <div class="plus-sign mr-3" @click="addField(index, userIDList)"></div>
          <div
            class="minus-sign"
            v-show="ifUserEnteredMoreThanOne"
            @click="removeField(index, userIDList)"
          ></div>
        </div>
      </div>
      <span class="errorStyleClass" v-if="invalidInputMessage">{{
        invalidInputMessage
      }}</span>
      <span class="errorStyleClass" v-if="!isUserValid && validateCount == 1">{{
        invalidLoginMessage
      }}</span>

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
      userIDList: [{ userID: "" }],
      invalidInputMessage: null,
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
      return !this.isAnyUserIDPresent || this.invalidInputMessage != "";
    },
    isUserValidated() {
      //if multiple SRN's are allowed, then this helps with the activation of the + button, to add more SRN's
      return (
        !this.isSingleEntryOnly &&
        this.userIDList[0]["userID"].length > this.maxLengthOfSRN - 1
      );
    },
  },
  methods: {
    isValidSRNFormat(e) {
      //checking to see if each char typed by user is only a number
      let char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },
    addField(value, list) {
      list.push({ value: "" });
    },
    removeField(index, list) {
      list.splice(index, 1);
    },
    updateValue(event) {
      if (event.target.value.length < this.maxLengthOfSRN) {
        this.invalidInputMessage = "Please type 10 numbers / कृपया १० संख्या टाइप करें";
        this.invalidLoginMessage = "";
      } else {
        this.invalidInputMessage = "";
      }
      if (event.target.value.length > this.maxLengthOfSRN) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfSRN);
        this.userIDList[0]["userID"] = event.target.value;
      }
    },

    async processForm() {
      var authType = "SRN";
      //parsing the userID from user input
      const userID = parseInt(this.userIDList["0"]["userID"]);

      //invokes the validation function
      let userIsValidated = validateSRN(
        userID,
        this.validateCount,
        this.isSingleEntryOnly,
        this.redirectID,
        this.isUserValid,
        this.purpose,
        this.purposeParams,
        this.redirectTo
      );

      userIsValidated.then((result) => {
        this.isUserValid = result.isUserValid;
        this.validateCount = result.validateCount;
        this.invalidLoginMessage = result.invalidLoginMessage;

        // either the user is valid or the user has been checked twice
        if (this.isUserValid || this.validateCount > 1) {
          sendSQSMessage(
            this.purpose,
            this.purposeParams,
            this.redirectTo,
            this.redirectID,
            userID,
            this.isUserValid,
            authType
          );
          redirectToDestination(
            this.purposeParams,
            userID,
            this.redirectID,
            this.redirectTo,
            this.isUserValid,
            authType
          );
        }
      });
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

.errorStyleClass {
  @apply mx-auto text-red-700 text-base mb-1;
}

.multiple-div {
  @apply border flex items-center;
}

.multipleStudentStyle {
  @apply relative flex flex-row w-1/4 mx-auto;
}

.plus-sign {
  border: 1px solid;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  color: green;
  transition: color 0.25s;
  position: relative;
}
.plus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  margin-left: -10px;
  margin-top: -3px;
  border-top: 7px solid;
}
.plus-sign::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  height: 20px;
  margin-left: -3px;
  margin-top: -10px;
  border-left: 7px solid;
}
.minus-sign {
  border: 1px solid;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  color: red;
  transition: color 0.25s;
  position: relative;
}
.minus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  margin-left: -10px;
  margin-top: -3px;
  border-top: 7px solid;
}
</style>
