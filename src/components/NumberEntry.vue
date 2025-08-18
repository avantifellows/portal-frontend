<template>
  <div class="flex flex-col justify-center" v-if="show">
    <p class="text-base mb-[10px]">
      {{ label }}<span v-if="isRequired">*</span>
    </p>
    <input
      type="tel"
      v-model="number"
      @keypress="isValidNumberEntry($event)"
      @input="updateNumberEntry($event)"
      class="border py-2 px-2 w-full rounded mx-auto border-grey"
      :class="invalid ? 'border-red' : 'border-grey'"
    />
    <span class="mt-[10px] text-sm text-grey italic">{{ helpText }}</span>

    <span
      v-if="isInvalidNumberEntryMessageShown"
      class="text-red text-sm mt-[10px]"
      >{{ invalidNumberEntryMessage }}</span
    >
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "NumberEntry",
  emits: ["update", "reset-invalid-login-message"],
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    isTypeSignIn: {
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
    maxLengthOfEntry: {
      type: Number,
      default: null,
    },
    dbKey: {
      type: String,
      default: "",
    },
    helpText: {
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
      number: "",
      invalidNumberEntryMessage: "",
      invalidEntryMessage: {
        en: `ID should have ${this.maxLengthOfEntry} digits`,
        hi: `आईडी में ${this.maxLengthOfEntry} अंक होने चाहिए`,
      },
    };
  },
  watch: {
    invalidNumberEntryMessage() {
      if (this.invalidNumberEntryMessage != "") {
        this.$emit("reset-invalid-login-message");
      }
    },
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

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.locale;
    },

    /** Checks if input entry is percentage */
    isPercentageLabel() {
      return this.label.includes("%");
    },

    /** Checks if input entry is CGPA */
    isCGPALabel() {
      return this.dbKey === "latest_cgpa";
    },
  },
  methods: {
    /**
     * Updates the number value based on user entry
     * @param {Event} event - The input event.
     */
    updateNumberEntry() {
      if (this.number.length == 0) {
        this.invalidNumberEntryMessage = "";
      } else if (
        this.isPercentageLabel &&
        (this.number < 0 || this.number > 100)
      ) {
        this.invalidNumberEntryMessage = "Percentage must be between 0 and 100";
        this.number = this.number.slice(0, 3).toString();
      } else if (
        this.isCGPALabel &&
        (parseFloat(this.number) < 0 || parseFloat(this.number) > 10)
      ) {
        this.invalidNumberEntryMessage = "CGPA must be between 0 and 10";
        // Don't slice for CGPA as it might be a valid decimal like 8.5
      } else if (
        this.maxLengthOfEntry != null &&
        this.number.length > this.maxLengthOfEntry
      ) {
        this.number = this.number.slice(0, this.maxLengthOfEntry).toString();
      } else if (
        this.number.length <= this.maxLengthOfEntry &&
        this.$props.isTypeSignIn == true
      ) {
        this.invalidNumberEntryMessage = "";
      } else if (
        this.maxLengthOfEntry != null &&
        this.number.length < this.maxLengthOfEntry &&
        this.$props.isTypeSignIn == false &&
        !this.isPercentageLabel &&
        !this.isCGPALabel
      ) {
        this.invalidNumberEntryMessage =
          this.invalidEntryMessage[this.getLocale];
      } else {
        this.invalidNumberEntryMessage = "";
      }
      if (this.invalidNumberEntryMessage == "") {
        this.$emit("update", this.number, this.dbKey);
      } else {
        this.$emit("update", "", this.dbKey);
      }
    },

    /**
     * Checks if the number entry is valid
     * @param {Event} event - The input event.
     * @returns {boolean} True if the number entry is valid, prevent user entry otherwise.
     */
    isValidNumberEntry(event) {
      // Use decimal validation for CGPA, numeric for others
      const validationType = this.isCGPALabel ? "decimal" : "numeric";

      if (validationTypeToFunctionMap[validationType](event)) {
        // Prevent multiple decimal points for CGPA
        if (
          this.isCGPALabel &&
          event.keyCode === 46 &&
          this.number.includes(".")
        ) {
          event.preventDefault();
          return false;
        }

        if (this.isPercentageLabel && this.number.length >= 3) {
          event.preventDefault();
        } else {
          return true;
        }
      } else {
        event.preventDefault();
      }
    },
  },
};
</script>
