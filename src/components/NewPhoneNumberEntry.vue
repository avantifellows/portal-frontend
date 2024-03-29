<template>
  <div class="" v-if="show">
    <p class="text-base mb-[10px] text-left">
      {{ label }}<span v-if="isRequired">*</span>
    </p>
    <FormKit
      type="tel"
      placeholder="xxxxxxxxxx"
      v-model="phoneNumber"
      @keypress="isValidPhoneNumberEntry($event)"
      @input="updatePhoneNumberEntry($event)"
      :help="helpText"
      :wrapper-class="{
        'mx-auto': true,
      }"
      :inner-class="{
        'border py-2 px-2 rounded mx-auto': true,
        'border-red': this.invalid,
        'border-grey': !this.invalid,
      }"
      :help-class="{
        'mt-[10px] text-sm text-grey italic': true,
      }"
    />

    <span
      v-if="isInvalidPhoneNumberMessageShown"
      class="text-red text-sm text-center mt-[10px]"
      >{{ invalidPhoneNumberMessage }}</span
    >
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "PhoneNumberEntry",
  emits: ["update"],
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      defult: "",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    dbKey: {
      type: String,
      default: "",
    },
    helpText: {
      type: String,
      default: "",
    },
    invalid: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      phoneNumber: "",
      invalidPhoneNumberMessage: "",
    };
  },
  computed: {
    /**
     * Checks if the invalid phone number entry message is shown.
     * @returns {boolean} True if the invalid number entry message is not null, false otherwise.
     */
    isInvalidPhoneNumberMessageShown() {
      return this.invalidPhoneNumberMessage != null;
    },

    /**
     * Checks if the phone number entry is valid.
     * @returns {boolean} True if the phone number entry is valid, or if it is not required. False otherwise.
     */
    isPhoneNumberEntryValid() {
      return this.isRequired
        ? this.phoneNumber != "" && this.invalidPhoneNumberMessage == ""
        : this.invalidPhoneNumberMessage == "";
    },
  },
  methods: {
    /**
     * Updates the phone number value based on user entry
     * @param {Event} event - The input event.
     */
    updatePhoneNumberEntry(event) {
      if (event.length == 0) {
        this.invalidPhoneNumberMessage = "";
      } else if (event.length > 10) {
        console.log("1:", this.phoneNumber);
        this.phoneNumber = event.slice(0, 10).toString();
        console.log("2:", this.phoneNumber, event.slice(0, 10).toString());
      } else if (event.length < 10) {
        this.invalidPhoneNumberMessage = "Please enter valid phone number";
      } else {
        this.invalidPhoneNumberMessage = "";
        this.$emit("update", this.phoneNumber, this.dbKey);
      }
    },

    /**
     * Checks if the phone number entry is valid
     * @param {Event} event - The input event.
     * @returns {boolean} True if the phone number entry is valid, prevent user entry otherwise.
     */
    isValidPhoneNumberEntry(event) {
      if (this.phoneNumber.length < 1) {
        if (
          !(
            event.key == "6" ||
            event.key == "7" ||
            event.key == "8" ||
            event.key == "9"
          )
        )
          event.preventDefault();
      } else {
        if (validationTypeToFunctionMap["numeric"](event)) {
          return true;
        } else event.preventDefault();
      }
    },
  },
};
</script>
