<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-xl xl:text-2xl mx-auto font-semibold md:w-full text-center"
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
        :classes="{
          outer: 'py-2 min-w-full',
          inner: 'p-4 border-2 rounded-md border-gray-500 ',
          input: 'mx-auto  focus:border-gray-800 focus:outline-none ',
          help: 'text-xs text-gray-400 pt-2',
          message: 'mx-auto text-red-700 text-base mb-1',
        }"
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
  },
  data() {
    return {
      date: "",
    };
  },
  watch: {
    date(newValue, oldValue) {
      this.$emit("update", this.date, this.dbKey);
    },
  },
  computed: {
    isDateEntryCompleteAndValid() {
      return this.isRequired ? this.date != "" : true;
    },
  },
};
</script>
