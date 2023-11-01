<template>
  <div class="flex flex-col" v-if="show">
    <p class="text-md font-semibold">
      {{ label }}<span v-if="isRequired">*</span>
    </p>

    <FormKit
      type="select"
      v-model="value"
      :options="options"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      :name="dbKey"
      :help="helpText"
      :classes="{}"
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
