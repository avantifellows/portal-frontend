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
        validation-visibility="live"
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
