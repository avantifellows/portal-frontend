<template>
  <div class="flex flex-row justify-between">
    <FormKit
      type="checkbox"
      :help="helpText"
      :name="dbKey"
      v-model="value"
      :validation="[isRequired ? ['required'] : []]"
      validation-visibility="dirty"
      :classes="{
        outer: ' pr-4',
      }"
    />
    {{ label }}
  </div>
</template>
<script>
export default {
  name: "Checkbox",
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
      this.$emit("update", this.value, this.dbKey);
    },
  },
};
</script>
