<template>
  <div class="" v-if="show">
    <p class="text-base mb-[10px]">
      {{ label }}<span v-if="isRequired">*</span>
    </p>

    <FormKit
      type="select"
      v-model="value"
      :options="options"
      :name="dbKey"
      :help="helpText"
      :input-class="{
        'w-full': true,
      }"
      :inner-class="{
        border: true,
        'py-2': true,
        'px-2': true,
        rounded: true,
        'border-grey': true,
        'overflow-hidden': true,
      }"
      :help-class="{
        'mt-[10px]': true,
        'text-sm': true,
        'text-grey': true,
        italic: true,
      }"
    />
  </div>
</template>

<script>
export default {
  name: "Dropdown",
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
    defaultValue: {
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
