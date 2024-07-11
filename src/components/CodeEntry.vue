<template>
    <div v-if="show">
      <p class="text-base mb-[10px]">{{ label }}<span v-if="isRequired">*</span></p>
  
      <input
        type="text"
        v-model="code"
        @keypress="isValidCodeEntry($event)"
        @input="updateCodeEntry($event)"
        class="border py-2 px-2 w-full rounded mx-auto border-grey"
      />
      <span class="mt-[10px] text-sm text-grey italic">{{ helpText }}</span>
  
      <span v-if="isInvalidCodeEntryMessageShown" class="text-red text-sm mt-[10px]">{{
        invalidCodeEntryMessage
      }}</span>
    </div>
  </template>
  <script>
  import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";
  
  export default {
    name: "CodeEntry",
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
      maxLengthOfEntry: {
      type: Number,
      default: null,
      },
      isRequired: {
        type: Boolean,
        default: false,
      },
      helpText: {
        type: String,
        default: "",
      },
      dbKey: {
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
        code: "",
        invalidCodeEntryMessage: "",
      };
    },
    computed: {
      /**
       * Checks if the invalid code entry message is shown.
       * @returns {boolean} True if the invalid code entry message is not null, false otherwise.
       */
      isInvalidCodeEntryMessageShown() {
        return this.invalidCodeEntryMessage != "";
      },

      /**
       * Checks if the code entry is valid.
       * @returns {boolean} True if the code entry is valid, or if it is not required. False otherwise.
       */
      isCodeEntryValid() {
        return this.isRequired
            ? this.code != "" && this.invalidCodeEntryMessage == ""
            : this.invalidCodeEntryMessage == "";
      },
    },
    watch: {
        code(value) {
        this.code = value.toUpperCase();
        },
    },
    methods: {
      /**
       * Updates the code value based on user entry
       * @param {Event} event - The input event.
       */
      updateCodeEntry() {
        if (this.code.length == 0) {
          this.invalidCodeEntryMessage = "";
        } else if (
        this.maxLengthOfEntry != null &&
        this.code.length > this.maxLengthOfEntry
      ) {
        this.code = this.code.slice(0, this.maxLengthOfEntry).toString();
      } 

        this.$emit("update", this.code, this.dbKey);
      },
  
      /**
       * Checks if the code entry is valid
       * @param {Event} event - The input event.
       * @returns {boolean} True if the code entry is valid, prevent user entry otherwise.
       */
      isValidCodeEntry(event) {
        if (validationTypeToFunctionMap["code"](event)) {
          return true;
        } else event.preventDefault();
      },
    },
  };
  </script>
  