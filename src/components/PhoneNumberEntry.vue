<template>
  <div class="flex flex-col justify-center">
    <p
      class="text-xl lg:text-xl xl:text-2xl mx-auto font-semibold md:w-full text-center"
    >
      Enter your phone number / अपना फोन नंबर डालें
    </p>
    <div class="flex flex-row justify-center">
      <input
        v-model="phoneNumber"
        type="tel"
        inputmode="numeric"
        placeholder="Your Phone Number / अपना फोन नंबर"
        required
        class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none mt-2"
        :class="selectInputBoxClasses()"
        @keypress="isValidPhoneNumberEntry($event)"
        @input="updatePhoneNumber($event)"
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
export default {
  name: "PhoneNumberEntry",
  emits: ["valid-entry", "reset-invalid-login-message"],
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
    /** Returns if the phone number entry is not complete */
    isPhoneNumberNotComplete() {
      return this.phoneNumber.length < 10;
    },
    /** Updates phone number based on user entry */
    updatePhoneNumber(event) {
      if (event.target.value.length == 0) {
        this.invalidPhoneNumberMessage = "";
      } else if (event.target.value.length > 10) {
        event.target.value = event.target.value.slice(0, 10);
        this.phoneNumber = event.target.value.toString();
      } else if (event.target.value.length < 10) {
        this.invalidPhoneNumberMessage = "Please enter valid phone number";
        this.$emit("reset-invalid-login-message");
      } else {
        this.invalidPhoneNumberMessage = "";
      }
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
        this.$emit("valid-entry", event);
      }
    },
  },
};
</script>
