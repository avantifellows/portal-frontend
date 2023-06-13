<template>
  <div class="flex flex-col justify-center">
    <div class="flex flex-row justify-center">
      <FormKit
        type="checkbox"
        :label="label"
        :help="helpText"
        :name="dbKey"
        v-model="value"
        :validation="[isRequired ? ['required'] : []]"
        validation-visibility="dirty"
      />
    </div>
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
