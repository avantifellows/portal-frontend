<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-xl xl:text-2xl mx-auto font-semibold md:w-full text-center"
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
        class="border-2 min-w-full rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none my-2"
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
    /** Returns if message for an invalid phone number needs to be shown */
    isInvalidPhoneNumberMessageShown() {
      return this.invalidPhoneNumberMessage != null;
    },
    isPhoneNumberEntryCompleteAndValid() {
      return this.isRequired
        ? this.phoneNumber != "" && this.invalidPhoneNumberMessage == ""
        : this.invalidPhoneNumberMessage == "";
    },
  },
  methods: {
    /** Determines how the input box should look.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidPhoneNumberMessage,
        },
      ];
    },

    /** Updates phone number based on user entry */
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
      }
      this.$emit("update", this.number, this.dbKey);
    },
    /** Checks for valid format of phone number; (0|91)?[6-9][0-9]{9}*/
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
