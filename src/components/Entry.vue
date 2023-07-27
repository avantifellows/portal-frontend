<template>
  <!-- loading spinner -->
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <div
    class="flex w-11/12 h-10 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20"
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>
  <!-- main div -->
  <div
    class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3"
    :class="{ 'opacity-20 pointer-events-none': isLoading }"
  >
    <!-- title -->
    <p
      class="w-3/4 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ inputBoxDisplayTitle }}
    </p>
    <!-- input options and delete options icon -->
    <div
      v-for="(input, index) in userIDList"
      :key="`idInput-${index}`"
      class="flex flex-row justify-center"
      :class="{ 'pl-12': hasUserEnteredMoreThanOne }"
    >
      <div>
        <input
          v-model="input.userID"
          :type="inputType"
          :inputmode="inputMode"
          pattern="[0-9]*"
          :placeholder="inputBoxPlaceholderText"
          required
          class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none"
          :class="selectInputBoxClasses(index)"
          @keypress="isValidEntry($event)"
          @input="updateUserId($event, index)"
          data-cy="inputBox"
          ondrop="return false"
          onpaste="return false"
        />
      </div>

      <div v-show="hasUserEnteredMoreThanOne" class="my-auto px-3">
        <button @click="deleteInputBox(index, userIDList)">
          <inline-svg
            class="fill-current text-red-600 h-8 w-8"
            :src="deleteSvg"
          />
        </button>
      </div>
    </div>

    <!-- invalid input and login message  -->
    <span
      v-if="isInvalidInputMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
      >{{ invalidInputMessage }}</span
    >
    <span
      v-if="isInvalidLoginMessageShown && !isExtraInputValidationRequired"
      class="mx-auto text-red-700 text-base mb-1"
      >{{ invalidLoginMessage }}</span
    >
    <!-- button to add another input -->
    <div v-if="isAddButtonAllowed" class="my-auto">
      <button
        class="flex flex-row mx-auto p-2 items-center border-2 rounded-xl bg-gray-200 btn"
        @click="addField"
      >
        <inline-svg
          class="fill-current text-green-600 h-10 w-10 pr-1"
          :src="addSvg"
        />
        <div class="border-l-2 border-gray-500 pl-3">
          <p class="leading-tight">
            {{ addButtonText }}
          </p>
        </div>
      </button>
    </div>
    <div v-show="isExtraInputValidationRequired" class="flex flex-col pt-4">
      <div v-show="isInputDateOfBirth">
        <div>
          <p
            class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
          >
            Enter your birthdate
          </p>
        </div>
        <div class="pt-4 flex mx-auto justify-evenly w-5/6 lg:w-1/2">
          <FormKit
            type="group"
            v-model="dateOfBirth"
            name="dob"
            :config="{
              classes: {
                wrapper: 'border-2 rounded-md  border-gray-500',
              },
            }"
          >
            <div class="flex flex-row space-x-3">
              <FormKit
                type="select"
                name="month"
                v-model="dateOfBirth.month"
                placeholder="Month"
                :options="monthList"
                validation="required"
              />
              <FormKit
                type="select"
                name="day"
                v-model="dateOfBirth.day"
                placeholder="Day"
                :options="dayList"
                validation="required"
              />
              <FormKit
                type="select"
                name="year"
                v-model="dateOfBirth.year"
                placeholder="Year"
                :options="yearList"
                validation="required"
              />
            </div>
          </FormKit>
        </div>
      </div>
      <!-- Phone number entry -->
      <div v-show="isInputPhoneNumber">
        <PhoneNumberEntry
          @validEntry="isValidEntry"
          @resetInvalidLoginMessage="resetInvalidLoginMessage"
          ref="phoneNumberEntry"
        />
      </div>
    </div>

    <span
      v-html="invalidLoginMessage"
      v-if="isInvalidLoginMessageShown && isExtraInputValidationRequired"
      class="mx-auto text-red-700 text-base mb-1 text-center text-xs md:text-sm"
    ></span>
    <!-- submit button -->
    <button
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 rounded disabled:opacity-50 btn"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
      data-cy="submitButton"
    >
      {{ submitButtonDisplayText }}
    </button>
    <button
      v-show="isExtraInputValidationRequired && isRegistrationEnabled"
      class="mx-auto pt-2 text-sm underline text-red-800"
      @click="redirectToSignup"
    >
      If you are a new student, click here to register
    </button>
  </div>
</template>

<script>
import { validateID } from "@/services/validation.js";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";
import useAssets from "@/assets/assets.js";
import PhoneNumberEntry from "@/components/PhoneNumberEntry.vue";

const assets = useAssets();
export default {
  name: "Entry",
  components: { PhoneNumberEntry },
  props: {
    redirectTo: {
      type: String,
      default: "",
    },
    redirectId: {
      type: String,
      default: "",
    },
    purpose: {
      type: String,
      default: "",
    },
    purposeParams: {
      type: String,
      default: "",
    },
    groupData: {
      type: Object,
      default() {
        return {};
      },
    },
    group: {
      type: String,
      default: "",
    },
    authType: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      default: "",
    },
    userIpAddress: {
      type: String,
      default: "",
    },
    isExtraInputValidationRequired: {
      type: Boolean,
      default: false,
    },
    enableRegistration: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      userIDList: [{ userID: "", valid: false }], //array containing user-ids and a valid flag for each
      isCurrentUserValid: false, // whether the current user is valid
      validateCount: 0, // count the number of times the user has been validated
      invalidLoginMessage: "",
      isLoading: false,
      invalidInputMessage: null, // message to show when the input being entered does not match the ID format,
      userType: this.$store.state.groupData.userType, // differentiates between different kinds of users
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      deleteSvg: assets.deleteSvg,
      addSvg: assets.addSvg,
      extraInputFields: [],
      dateOfBirth: { month: "", day: "", year: "" },
      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
    };
  },
  computed: {
    formatDateOfBirth() {
      return (
        (this.dateOfBirth.month < 10
          ? "0" + this.dateOfBirth.month
          : this.dateOfBirth.month) +
        "-" +
        (this.dateOfBirth.day < 10
          ? "0" + this.dateOfBirth.day
          : this.dateOfBirth.day) +
        "-" +
        this.dateOfBirth.year
      );
    },
    /** Returns if the authentication type includes date of birth */
    isInputDateOfBirth() {
      return this.authType.includes("DOB");
    },
    /** Returns if the authentication type includes phone number */
    isInputPhoneNumber() {
      return this.authType.includes("PH");
    },
    /** Returns if the group has enabled registration */
    isRegistrationEnabled() {
      return this.groupData.enableRegistration && this.enableRegistration;
    },
    getGroupImages() {
      return this.groupData.images;
    },

    /** Returns the input mode stored against the group */
    inputMode() {
      return this.groupData.input.mode;
    },

    /** Returns the input type stored against the group */
    inputType() {
      return this.groupData.input.type;
    },

    /** Returns the placeholder text stored against the group */
    inputBoxPlaceholderText() {
      return this.groupData.text.default.placeholder;
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
      return this.redirectTo == "plio" || this.redirectTo == "quiz";
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
        this.isCurrentEntryIncomplete ||
        this.isBirthDateEntryIncomplete ||
        (this.isInputPhoneNumber &&
          this.$refs.phoneNumberEntry.isPhoneNumberNotComplete())
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
        this.numOfUserIds < this.maxNumberOfIds &&
        !this.isExtraInputValidationRequired
      );
    },

    /** Checks if entire birth date is entered */
    isBirthDateEntryIncomplete() {
      return this.isExtraInputValidationRequired && this.isInputDateOfBirth
        ? this.dateOfBirth.month == "" ||
            this.dateOfBirth.day == "" ||
            this.dateOfBirth.year == ""
        : false;
    },

    /** Checks if the current input entry has the required number of characters */
    isCurrentEntryIncomplete() {
      return this.latestEntry["userID"].length < this.maxLengthOfId;
    },

    /** Returns the most recently entered input */
    latestEntry() {
      return this.userIDList.slice(-1)[0];
    },

    /** Whether the current typed ID is valid */
    isInvalidLoginMessageShown() {
      return (
        (!this.isCurrentUserValid && this.validateCount == 1) ||
        (!this.isCurrentUserValid &&
          this.validateCount == 0 &&
          this.isExtraInputValidationRequired) ||
        this.group == "Candidates"
      );
    },

    /** Whether input being typed is in the correct format */
    isInvalidInputMessageShown() {
      return this.invalidInputMessage != null;
    },

    /** Returns the heading text for the input box */
    inputBoxDisplayTitle() {
      return this.groupData.text.default.display;
    },

    /** Returns the button text for adding another input box */
    inputBoxAddButtonText() {
      return this.groupData.text.default.addButton;
    },

    /** Returns the maximum length of the ID */
    maxLengthOfId() {
      return this.groupData.input.maxLengthOfId;
    },

    /** Returns the basic validation type for the input */
    basicValidationType() {
      return this.groupData.input.basicValidationType;
    },

    /** Returns the invalid input message stored against each group */
    invalidInputText() {
      return this.groupData.text.default.invalid.input;
    },

    /** Returns the maximum number of ID's a user can enter */
    maxNumberOfIds() {
      return this.groupData.maxNumberOfIds;
    },

    /** Returns the invalid login message stored against each group  */
    invalidLoginText() {
      return this.groupData.text.default.invalid.login;
    },

    addButtonText() {
      return this.groupData.text.default.addButton;
    },

    /** Returns the text for the submit button */
    submitButtonDisplayText() {
      return this.groupData.text.default.submitButton;
    },
  },
  methods: {
    /** Determines how the input box should look.
     * @param {Number} index - index of the input box
     */
    selectInputBoxClasses(index) {
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
      if (validationTypeToFunctionMap[this.basicValidationType](event)) {
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
      const latestUserID = this.latestEntry["userID"];
      await this.authenticateID(latestUserID);
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
      } else if (event.target.value.length > this.maxLengthOfId) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfId);
        this.userIDList[index]["userID"] = event.target.value.toString();
      } else if (event.target.value.length < this.maxLengthOfId) {
        this.invalidInputMessage = this.invalidInputText;
        this.resetInvalidLoginMessage();
      } else {
        this.resetInvalidInputMessage();
      }
    },

    /** This method is called whenever "+" button is clicked. It authenticates the most recent typed ID.
     * @param {String} userID - most recent ID
     */
    async authenticateID(userID) {
      this.isLoading = true;
      let userValidationResponse = await validateID(
        userID,
        this.authType,
        this.validateCount,
        this.dateOfBirth,
        this.isExtraInputValidationRequired,
        this.$refs.phoneNumberEntry.phoneNumber,
        this.group
      );

      if (
        (this.group == "HimachalStudents" || this.group == "EnableStudents" || this.group="NGOStudents") &&
        this.redirectTo == "quiz"
      ) {
        this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
        this.validateCount = 0;
        this.isLoading = false;
      } else if (this.isExtraInputValidationRequired) {
        this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
        this.validateCount = 2;
        this.isLoading = false;
      } else {
        this.isCurrentUserValid = userValidationResponse.isCurrentUserValid;
        this.validateCount = userValidationResponse.validateCount;
        this.isLoading = false;

        if (this.validateCount == 1) {
          this.invalidLoginMessage = this.invalidLoginText;
        }
        if (this.invalidLoginMessage != "") {
          this.resetEntry(this.numOfUserIds - 1);
        }
      }
    },

    /** Authenticates the last entry typed before the submit button is clicked.
     * Also, redirects user to the destination and sends a SQS message.
     */
    async authenticate() {
      let latestUserID = this.latestEntry["userID"];
      await this.authenticateID(latestUserID);

      if (!this.isCurrentUserValid && this.validateCount == 0) {
        this.invalidLoginMessage =
          this.group == "Candidates"
            ? "Phone Number is incorrect!"
            : "Student ID entered is incorrect. Please try again!<br/> Please register incase you are a new user.";
      }
      this.setValidFlag();
      if (this.isCurrentUserValid || this.validateCount > 1) {
        if (
          !this.isCurrentUserValid &&
          this.purposeParams == "reporting" &&
          this.group == "EnableStudents"
        ) {
          this.$router.push({
            path: `aiet-reporting/${this.redirectId}/${latestUserID}/${this.formatDateOfBirth}`,
          });
        } else {
          if (
            redirectToDestination(
              this.purposeParams,
              this.userIDList[0]["userID"],
              this.redirectId,
              this.redirectTo,
              this.authType,
              this.group
            )
          ) {
            sendSQSMessage(
              this.purpose,
              this.purposeParams,
              this.redirectTo,
              this.redirectId,
              this.userIDList,
              this.authType,
              this.group,
              this.$store.state.groupData.userType,
              this.sessionId,
              this.userIpAddress,
              this.isExtraInputValidationRequired && this.isInputPhoneNumber
                ? this.$refs.phoneNumberEntry.phoneNumber
                : "",
              this.$store.state.sessionData.batch
                ? this.$store.state.sessionData.batch
                : ""
            );
          }
        }
      }
    },
    /**
     * Redirects to Sign up Component
     */
    redirectToSignup() {
      this.$router.push({
        name: "Signup",
      });
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
