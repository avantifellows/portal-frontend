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
        :multiple="multiple"
        :name="dbKey"
        :help="helpText"
        :classes="{
          outer: 'py-2  min-w-full',
          inner: 'p-4 border-2 rounded-md border-gray-500 ',
          input: 'mx-auto min-w-full focus:border-gray-800 focus:outline-none ',
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
