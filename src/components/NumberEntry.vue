<template>
  <div class="flex flex-col justify-center">
    <p
      class="text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <input
        v-model="number"
        type="text"
        inputmode="numeric"
        :placeholder="placeholder"
        :required="isRequired"
        class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none mt-2"
        :class="selectInputBoxClasses()"
        @keypress="isValidNumberEntry($event)"
        @input="updateNumberEntry($event)"
        ondrop="return false"
        onpaste="return false"
      />
    </div>
    <span
      v-if="isInvalidNumberEntryMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
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
      if (event.target.value.length == 0) {
        this.invalidNumberEntryMessage = "";
      } else if (event.target.value.length > this.maxLengthOfEntry) {
        event.target.value = event.target.value.slice(0, this.maxLengthOfEntry);
        this.number = event.target.value.toString();
      } else if (event.target.value.length < this.maxLengthOfEntry) {
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
