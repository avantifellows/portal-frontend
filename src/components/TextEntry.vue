<template>
  <div class="flex flex-col">
    <p class="text-md font-semibold">
      {{ label }}
    </p>

    <FormKit
      type="text"
      :help="helpText"
      v-model="text"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      :name="dbKey"
      @keypress="isValidTextEntry($event)"
      @input="updateTextEntry($event)"
      ondrop="return false"
      onpaste="return false"
    />

    <span
      v-if="isInvalidTextEntryMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
      >{{ invalidTextEntryMessage }}</span
    >
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "TextEntry",
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
     * Generates the CSS classes for the input box based on the state of the text entry.
     * @returns {string[]} An array of CSS classes.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidTextEntryMessage,
        },
      ];
    },

    /**
     * Updates the text value based on user entry
     * @param {Event} event - The input event.
     */
    updateTextEntry(event) {
      if (event.length == 0) {
        this.invalidTextEntryMessage = "";
      } else {
        this.text = event.toString();
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
