<template>
  <div v-if="show">
    <p class="text-base mb-[10px]">{{ label }}<span v-if="isRequired">*</span></p>
    <FormKit
      type="date"
      :name="dbKey"
      v-model="date"
      :help="helpText"
      :input-class="{
        'w-full': true,
      }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[10px] text-sm text-grey italic': true,
      }"
    />
    <span v-if="isInvalidDateEntryMessageShown" class="text-red text-sm mt-[10px]">{{
      invalidDateEntryMessage
    }}</span>
  </div>
</template>
<script>
export default {
  name: "Datepicker",
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
    dbKey: {
      type: String,
      default: "",
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      date: "",
      invalidDateEntryMessage: "",
      invalidEntryMessage: {
        en: `Please enter a valid date`,
        hi: `कृपया कोई मान्य दिनांक दर्ज करें`,
      },
    };
  },
  watch: {
    /**
     * Emits 'update' event whenever the date value is changed
     */
    date() {
      if (
        new Date(this.date) < new Date("01-01-1990") ||
        new Date(this.date) > new Date()
      ) {
        this.invalidDateEntryMessage = this.invalidEntryMessage[this.getLocale];
        this.$emit("update", "", this.dbKey);
      } else {
        this.invalidDateEntryMessage = "";
        this.$emit("update", this.date, this.dbKey);
      }
    },
  },
  computed: {
    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.locale;
    },
    /**
     * Checks if the invalid text entry message is shown.
     * @returns {boolean} True if the invalid text entry message is not null, false otherwise.
     */
    isInvalidDateEntryMessageShown() {
      return this.invalidDateEntryMessage != null;
    },
    /**
     * Checks if the number entry is valid.
     * @returns {boolean} True if the number entry is valid, or if it is not required. False otherwise.
     */
    isDateEntryValid() {
      return this.isRequired
        ? this.date != "" && this.invalidDateEntryMessage
        : this.invalidDateEntryMessage == "";
    },
  },
};
</script>
