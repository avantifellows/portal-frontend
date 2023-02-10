<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      Enter your phone number / अपना फोन नंबर डालें
    </p>
    <div class="flex flex-row justify-center">
      <input
        v-model="phoneNumber"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="Your Phone Number / अपना फोन नंबर"
        required
        class="border-2 rounded-md p-4 mx-auto border-gray-500 focus:border-gray-800 focus:outline-none mt-2"
        :class="selectInputBoxClasses()"
        @keypress="$emit('valid-entry', $event)"
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
import { mapActions } from "vuex";
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
    isInvalidPhoneNumberMessageShown() {
      return this.invalidPhoneNumberMessage != null;
    },
  },
  methods: {
    ...mapActions(["setPhoneNumber"]),
    /** Determines how the input box should look.
     */
    selectInputBoxClasses() {
      return [
        {
          "border-red-600 focus:border-red-600": this.invalidPhoneNumberMessage,
        },
      ];
    },
    isPhoneNumberComplete() {
      console.log(this.phoneNumber, this.phoneNumber.length);
      return this.phoneNumber.length < 10;
    },
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
  },
};
</script>
