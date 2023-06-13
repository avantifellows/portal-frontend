<template>
  <div class="flex flex-col justify-center">
    <p
      class="text-xl lg:text-xl xl:text-2xl mx-auto font-semibold md:w-full text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center mt-2">
      <FormKit
        type="date"
        :name="dbKey"
        :validation="[
          isRequired ? ['required'] : [],
          ['date_after', '1990'],
          ['date_before', '2020'],
        ]"
        v-model="date"
        validation-visibility="dirty"
        :help="helpText"
        :classes="{
          outer: 'py-2 min-w-full',
          inner: 'p-4 border-2 rounded-md border-gray-500 ',
          input: 'mx-auto focus:border-gray-800 focus:outline-none ',
          help: 'text-xs text-gray-400 pt-2',
          message: 'mx-auto text-red-700 text-xs mb-1',
        }"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: "Datepicker",
  emits: ["update"],
  props: {
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
