<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <div
    class="flex w-11/12 h-10 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20"
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3">
    <p
      class="text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center mb-5"
    >
      {{ formTitle }}
    </p>

    <component
      v-for="(formField, index) in formFields"
      :key="index"
      :is="formField.component"
      :label="formField.label"
      :isRequired="formField.isRequired"
      :dbKey="formField.key"
      :placeholder="formField.placeholder"
      :options="formField.options"
      :multiple="formField.multiple"
      :maxLengthOfEntry="formField.maxLengthOfEntry"
      @update="updateUserData"
    />
    <!-- submit button -->
    <button
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 rounded disabled:opacity-50 btn"
      data-cy="submitButton"
      :disabled="isSubmitButtonDisabled"
      @click="authenticate"
    >
      SIGN UP
    </button>
  </div>
</template>
<script>
import formData from "../components/formData.json";
import { typeToInputParameters } from "../services/authToInputParameters";

export default {
  name: "SignUp",
  data() {
    return {
      isLoading: false,
      userData: {},
    };
  },
  computed: {
    /** returns images to be displayed for a group */
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    formTitle() {
      return formData.title;
    },
    formFields() {
      return formData.fields.map((field) => {
        return {
          ...field,
          component: typeToInputParameters[field.type],
        };
      });
    },
    /** whether submit button is disabled */
    isSubmitButtonDisabled() {
      return !Object.keys(formData.fields).every((field) => {
        formData.fields[field].key in this.userData;
      });

      //return true;
    },
  },
  methods: {
    updateUserData(value, key) {
      this.userData[key] = value;
      console.log(this.userData);
    },
  },
};
</script>
