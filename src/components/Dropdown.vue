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
        :options="options"
        :placeholder="placeholder"
        :validation="[isRequired ? ['required'] : []]"
        validation-visibility="dirty"
        :name="dbKey"
        :help="helpText"
        :classes="{
          outer: 'min-w-full max-w-full',
          inner:
            'p-4 border-2 rounded-md border-gray-500 min-w-full max-w-full',
          input:
            'mx-auto  focus:border-gray-800 focus:outline-none min-w-full max-w-full',
          help: 'text-xs text-gray-400 pt-2',
        }"
      />
    </div>
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
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: "",
    };
  },
  watch: {
    /**
     * Emits 'update' event whenever the dropdown value is changed
     */
    value() {
      this.$emit("update", this.value, this.dbKey);
    },
  },
};
</script>
