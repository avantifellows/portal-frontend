<template>
  <div class="" v-if="show">
    <p class="text-base mb-[10px]">
      {{ label }}<span v-if="isRequired">*</span>
    </p>

  <div v-if="multipleSelect" class="space-y-2">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="flex items-center space-x-2"
    >
      <FormKit
        type="checkbox"
        :name="dbKey"
        :value="option.value"
        :checked="value.includes(option.value)"
        @input="toggleSelection(option.value)"
        :input-class="{ 'cursor-pointer': true }"
      />
      <span class="text-base">{{ option.label }}</span>
    </div>
    <p class="text-sm text-gray-500 italic mb-2">{{ helpText }}</p>
  </div>

  <FormKit
    v-else
    type="select"
    v-model="value"
    :options="options"
    :name="dbKey"
    :help="helpText"
    placeholder=" "
    :input-class="{ 'w-full cursor-pointer': true }"
    :inner-class="{
      'border py-2 px-2 rounded border-grey overflow-hidden cursor-pointer': true,
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
    multipleSelect: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      value: this.multipleSelect ? [] : "",
    };
  },
  methods: {
    toggleSelection(selectedValue) {
      // for checkbox
      if (this.value.includes(selectedValue)) {
        this.value = this.value.filter((item) => item !== selectedValue);
      } else {
        this.value.push(selectedValue);
      }
      this.$emit("update", this.value, this.dbKey);
    },
  },
  watch: {
    /**
     * Emits 'update' event whenever the dropdown value is changed
     */
    value() {
      // for dropdown
      this.$emit("update", this.value, this.dbKey);
    },
  },
};
</script>
