<template>
  <div class="" v-if="show">
    <p class="text-base mb-[10px]">{{ label }}<span v-if="isRequired">*</span></p>

    <FormKit
      type="select"
      v-model="value"
      :options="options"
      :name="dbKey"
      :help="helpText"
      placeholder=" "
      :input-class="{ 'w-full': true }"
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
