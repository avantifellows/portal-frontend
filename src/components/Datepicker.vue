<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <FormKit
        type="date"
        :name="dbKey"
        :validation="[
          isRequired ? ['required'] : [],
          ['date_after', '1990'],
          ['date_before', '2020'],
        ]"
        v-model="date"
        validation-visibility="dirty"
        :help="helpText"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: "Datepicker",
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
    dbKey: {
      type: String,
      default: "",
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      date: "",
    };
  },
  watch: {
    /**
     * Emits 'update' event whenever the date value is changed
     */
    date() {
      this.$emit("update", this.date, this.dbKey);
    },
  },
};
</script>
