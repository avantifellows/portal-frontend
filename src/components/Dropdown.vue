<template>
  <div class="flex flex-col justify-center">
    <p
      class="text-xl lg:text-xl xl:text-2xl mx-auto font-semibold md:w-full text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <FormKit
        type="select"
        v-model="value"
        :placeholder="placeholder"
        :options="options"
        :validation="[isRequired ? ['required'] : []]"
        validation-visibility="dirty"
        :name="dbKey"
        :help="helpText"
        :classes="{
          outer: 'py-2  min-w-full ',
          wrapper: '',
          inner: 'p-4 border-2 rounded-md border-gray-500 ',
          input: 'mx-auto min-w-full focus:border-gray-800 focus:outline-none ',
          help: 'text-xs text-gray-400 pt-2',
        }"
      />
    </div>
    <span
      v-if="isInvalidEntryMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
      >{{ invalidEntryMessage }}</span
    >
  </div>
</template>
<script>
export default {
  name: "Dropdown",
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
    options: {
      type: Array,
      default: [],
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
      value: "",
      invalidEntryMessage: "",
    };
  },
  watch: {
    value(newValue, oldValue) {
      this.$emit("update", this.value, this.dbKey);
    },
  },
  computed: {
    /** Returns if message for an invalid text entry needs to be shown */
    isInvalidEntryMessageShown() {
      return this.invalidEntryMessage != null;
    },
  },
};
</script>
