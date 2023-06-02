<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
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
