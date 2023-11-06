<template>
  <div v-if="show">
    <p class="text-base mb-[10px]">
      {{ label }}<span v-if="isRequired">*</span>
    </p>

    <FormKit
      type="text"
      :help="helpText"
      v-model="text"
      :name="dbKey"
      @keypress="isValidTextEntry($event)"
      @input="updateTextEntry($event)"
      ondrop="return false"
      onpaste="return false"
      :input-class="{
        'w-full': true,
      }"
      :inner-class="{
        border: true,
        'py-2': true,
        'px-2': true,
        rounded: true,
        'border-grey': true,
        'overflow-hidden': true,
      }"
      :help-class="{
        'mt-[10px]': true,
        'text-sm': true,
        'text-grey': true,
        italic: true,
      }"
    />

    <span
      v-if="isInvalidTextEntryMessageShown"
      class="text-red text-sm mt-[10px]"
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
