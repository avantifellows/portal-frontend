<template>
  <div class="flex flex-col">
    <p class="text-left text-md font-semibold">
      {{ label }}
    </p>
    <FormKit
      type="tel"
      placeholder="xxxxxxxxxx"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      v-model="phoneNumber"
      @keypress="isValidPhoneNumberEntry($event)"
      @input="updatePhoneNumberEntry($event)"
      ondrop="return false"
      onpaste="return false"
      help="Phone number can start only with 6,7,8,9"
    />

    <span
      v-if="isInvalidPhoneNumberMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
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
     * Generates the CSS classes for the input box based on the state of the phone number entry.
     * @returns {string[]} An array of CSS classes.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidPhoneNumberMessage,
        },
      ];
    },

    /**
     * Updates the phone number value based on user entry
     * @param {Event} event - The input event.
     */
    updatePhoneNumberEntry(event) {
      if (event.length == 0) {
        this.invalidPhoneNumberMessage = "";
      } else if (event.length > 10) {
        this.phoneNumber = event.slice(0, 10).toString();
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
