<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <input
        v-model="text"
        type="text"
        inputmode="text"
        :placeholder="placeholder"
        :required="isRequired"
        class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none mt-2"
        :class="selectInputBoxClasses()"
        @keypress="isValidTextEntry($event)"
        @input="updateTextEntry($event)"
        ondrop="return false"
        onpaste="return false"
      />
    </div>
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
    /** Returns if message for an invalid text entry needs to be shown */
    isInvalidTextEntryMessageShown() {
      return this.invalidTextEntryMessage != null;
    },
  },
  methods: {
    /** Determines how the input box should look.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidTextEntryMessage,
        },
      ];
    },
    /** Updates text based on user entry */
    updateTextEntry(event) {
      if (event.target.value.length == 0) {
        this.invalidTextEntryMessage = "";
      } else {
        this.text = event.target.value.toString();
        this.$emit("update", this.text, this.dbKey);
      }
    },
    /** Checks for valid input of text */
    isValidTextEntry(event) {
      if (validationTypeToFunctionMap["text"](event)) {
        return true;
      } else event.preventDefault();
    },
  },
};
</script>
