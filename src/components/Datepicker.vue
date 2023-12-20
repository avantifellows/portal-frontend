<template>
  <div v-if="show">
    <p class="text-base mb-[10px]">
      {{ label }}<span v-if="isRequired">*</span>
    </p>
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
    };
  },
  watch: {
    /**
     * Emits 'update' event whenever the date value is changed
     */
    date() {
      this.$emit("update", this.date, this.dbKey);
    },
  },
  computed: {
    /**
     * Checks if the number entry is valid.
     * @returns {boolean} True if the number entry is valid, or if it is not required. False otherwise.
     */
    isDateEntryValid() {
      return this.isRequired ? this.date != "" : true;
    },
  },
};
</script>
