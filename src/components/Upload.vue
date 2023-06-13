<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <FormKit
        type="file"
        :name="dbKey"
        accept=".pdf,.doc,.docx,.xml,.md,.csv"
        :help="helpText"
        multiple="true"
        :value="value"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: "Upload",
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
     * Emits 'update' event whenever the upload value is changed
     */
    value() {
      this.$emit("update", this.value, this.dbKey);
    },
  },
};
</script>
