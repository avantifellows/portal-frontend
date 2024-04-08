<template>
  <div v-if="show">
    <p class="text-base mb-[10px]">{{ label }}<span v-if="isRequired">*</span></p>

    <input
      type="text"
      v-model="text"
      @keypress="isValidTextEntry($event)"
      @input="updateTextEntry($event)"
      class="border py-2 px-2 w-full rounded mx-auto border-grey"
    />
    <span class="mt-[10px] text-sm text-grey italic">{{ helpText }}</span>

    <span v-if="isInvalidTextEntryMessageShown" class="text-red text-sm mt-[10px]">{{
      invalidTextEntryMessage
    }}</span>
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "TextEntry",
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
  },
  data() {
    return {
      text: "",
      invalidTextEntryMessage: "",
    };
  },
  computed: {
    /**
     * Checks if the invalid text entry message is shown.
     * @returns {boolean} True if the invalid text entry message is not null, false otherwise.
     */
    isInvalidTextEntryMessageShown() {
      return this.invalidTextEntryMessage != null;
    },
  },
  methods: {
    /**
     * Updates the text value based on user entry
     * @param {Event} event - The input event.
     */
    updateTextEntry() {
      if (this.text.length == 0) {
        this.invalidTextEntryMessage = "";
      }
      this.$emit("update", this.text, this.dbKey);
    },

    /**
     * Checks if the text entry is valid
     * @param {Event} event - The input event.
     * @returns {boolean} True if the text entry is valid, prevent user entry otherwise.
     */
    isValidTextEntry(event) {
      if (validationTypeToFunctionMap["text"](event)) {
        return true;
      } else event.preventDefault();
    },
  },
};
</script>
