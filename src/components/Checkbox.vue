<template>
  <div class="flex flex-row" v-if="show">
    <span v-if="isRequired">*</span>
    <FormKit
      type="checkbox"
      :help="helpText"
      :name="dbKey"
      v-model="value"
      :label="label"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      :classes="{
        inner: 'border border-4',
      }"
    />
    <!-- <p class="text-sm">
      {{ label }}
    </p> -->
  </div>
</template>
<script>
export default {
  name: "Checkbox",
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
     * Emits 'update' event whenever the checkbox value is changed
     */
    value() {
      if (this.value) {
        this.$emit("update", this.value, this.dbKey);
      } else {
        this.$emit("update", "", this.dbKey);
      }
    },
  },
};
</script>
