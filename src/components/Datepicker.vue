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
        name="birthdate"
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
  props: {
    label: {
      type: String,
      default: "",
    },

    isRequired: {
      type: Boolean,
      default: false,
    },

    key: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      date: "",
    };
  },
};
</script>
