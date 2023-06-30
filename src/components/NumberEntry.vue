<template>
  <div class="flex flex-col justify-center">
    <p class="text-md md:text-lg font-semibold">
      {{ label }}
    </p>
    <FormKit
      type="number"
      v-model="number"
      :help="helpText"
      :name="dbKey"
      ondrop="return false"
      onpaste="return false"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      @keypress="isValidNumberEntry($event)"
      @input="updateNumberEntry($event)"
    />

    <span
      v-if="isInvalidNumberEntryMessageShown"
      class="mx-auto text-red-700 text-sm mb-1"
      >{{ invalidNumberEntryMessage }}</span
    >
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "NumberEntry",
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
    maxLengthOfEntry: {
      type: Number,
      default: 1,
    },
    dbKey: {
      type: String,
      default: "",
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      number: "",
      invalidNumberEntryMessage: "",
    };
  },
  computed: {
    /**
     * Checks if the invalid number entry message is shown.
     * @returns {boolean} True if the invalid number entry message is not null, false otherwise.
     */
    isInvalidNumberEntryMessageShown() {
      return this.invalidNumberEntryMessage != null;
    },

    /**
     * Checks if the number entry is valid.
     * @returns {boolean} True if the number entry is valid, or if it is not required. False otherwise.
     */
    isNumberEntryValid() {
      return this.isRequired
        ? this.number != "" && this.invalidNumberEntryMessage == ""
        : this.invalidNumberEntryMessage == "";
    },
  },
  methods: {
    /**
     * Generates the CSS classes for the input box based on the state of the number entry.
     * @returns {string[]} An array of CSS classes.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidNumberEntryMessage,
        },
      ];
    },

    /**
     * Updates the number value based on user entry
     * @param {Event} event - The input event.
     */
    updateNumberEntry(event) {
      if (event.length == 0) {
        this.invalidNumberEntryMessage = "";
      } else if (event.length > this.maxLengthOfEntry) {
        this.number = event.slice(0, this.maxLengthOfEntry).toString();
      } else if (event.length < this.maxLengthOfEntry) {
        this.invalidNumberEntryMessage = "Please enter valid number";
      } else {
        this.invalidNumberEntryMessage = "";
      }
      this.$emit("update", this.number, this.dbKey);
    },

    /**
     * Checks if the number entry is valid
     * @param {Event} event - The input event.
     * @returns {boolean} True if the number entry is valid, prevent user entry otherwise.
     */
    isValidNumberEntry(event) {
      if (validationTypeToFunctionMap["numeric"](event)) {
        return true;
      } else event.preventDefault();
    },
  },
};
</script>
