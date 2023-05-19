<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
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
  emits: ["valid-entry"],
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
    /** Returns if message for an invalid number entry needs to be shown */
    isInvalidNumberEntryMessageShown() {
      return this.invalidNumberEntryMessage != null;
    },
    isNumberEntryCompleteAndValid() {
      return this.isRequired
        ? this.number != "" && this.invalidNumberEntryMessage == ""
        : this.invalidNumberEntryMessage == "";
    },
  },
  methods: {
    /** Determines how the input box should look.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidNumberEntryMessage,
        },
      ];
    },
    /** Updates number based on user entry */
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
    },
    /** Checks for valid input of number */
    isValidNumberEntry(event) {
      if (validationTypeToFunctionMap["numeric"](event)) {
        return true;
      } else event.preventDefault();
    },
  },
};
</script>
