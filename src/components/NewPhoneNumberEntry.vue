<template>
  <div class="" v-if="show">
    <p class="text-base mb-[10px] text-left">
      {{ label }}<span v-if="isRequired">*</span>
    </p>
    <input
      class="border py-2 px-2 w-full rounded mx-auto border-grey"
      :class="invalid ? 'border-red' : 'border-grey'"
      type="tel"
      placeholder="xxxxxxxxxx"
      v-model="phoneNumber"
      @keypress="isValidPhoneNumberEntry($event)"
      @input="updatePhoneNumberEntry($event)"
    />
    <span class="mt-[10px] text-sm text-grey italic">{{ helpText }}</span>

    <p
      v-if="isInvalidPhoneNumberMessageShown"
      class="text-red text-sm text-center mt-[10px]"
    >
      {{ invalidPhoneNumberMessage }}
    </p>
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
     */
    updatePhoneNumberEntry() {
      if (this.phoneNumber.length == 0) {
        this.invalidPhoneNumberMessage = "";
      } else if (this.phoneNumber.length > 10) {
        this.phoneNumber = this.phoneNumber.slice(0, 10).toString();
      } else if (this.phoneNumber.length < 10) {
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
