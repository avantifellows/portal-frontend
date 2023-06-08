<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <input
        v-model="phoneNumber"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder"
        :required="isRequired"
        class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none mt-2"
        :class="selectInputBoxClasses()"
        @keypress="isValidPhoneNumberEntry($event)"
        @input="updatePhoneNumberEntry($event)"
        ondrop="return false"
        onpaste="return false"
      />
    </div>
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
      if (event.target.value.length == 0) {
        this.invalidPhoneNumberMessage = "";
      } else if (event.target.value.length > 10) {
        event.target.value = event.target.value.slice(0, 10);
        this.phoneNumber = event.target.value.toString();
      } else if (event.target.value.length < 10) {
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
