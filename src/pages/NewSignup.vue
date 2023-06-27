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
    class="flex w-11/12 h-16 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20"
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div
    v-if="!formSubmitted"
    class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3"
  >
    <p
      class="text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center mb-5 uppercase"
    >
      {{ formTitle }}
    </p>

    <div class="mx-auto w-full xl:w-1/2">
      <component
        class="mx-auto w-1/2 lg:w-1/4 my-4"
        v-for="(formField, index) in formFields"
        :key="index"
        :is="formField.component"
        :label="formField.label"
        :isRequired="formField.isRequired"
        :dbKey="formField.key"
        :placeholder="formField.placeholder"
        :options="getOptions(formField)"
        :multiple="formField.multiple"
        :maxLengthOfEntry="formField.maxLengthOfEntry"
        :helpText="formField.helpText"
        @update="updateUserData"
      />
    </div>
    <!-- submit button -->
    <button
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-4 rounded disabled:opacity-50 btn"
      :disabled="signUpDisabled"
      @click="signUp"
    >
      SIGN UP
    </button>
  </div>
  <div
    v-if="formSubmitted"
    class="w-5/6 lg:w-1/2 mx-auto flex flex-col bg-peach text-center mt-20 shadow-sm justify-evenly text-lg md:text-xl rounded-md p-6 space-y-6"
  >
    <template v-if="idGeneration">
      <p>
        Your ID is <b>{{ userData["user_id"] }}</b>
      </p>
      <p>Please note this down. Use this to sign-in going forward.</p>
    </template>

    <button
      v-if="redirection"
      @click="redirect"
      :disabled="isRedirectionButtonDisabled"
      class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-2 rounded disabled:opacity-50 btn"
    >
      Done
    </button>
  </div>
</template>
<script>
import { typeToInputParameters } from "@/services/authToInputParameters";
import { redirectToDestination } from "@/services/redirectToDestination";
import UserAPI from "@/services/API/user.js";
import FormSchemaAPI from "@/services/API/form.js";
import useAssets from "@/assets/assets.js";
import { sendSQSMessage } from "@/services/API/sqs";
const assets = useAssets();

export default {
  name: "SignUp",
  data() {
    return {
      isLoading: false,
      userData: {},
      formSubmitted: false,
      signUpDisabled: true,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      userId: "",
      formData: {},
    };
  },
  async created() {
    this.formData = await FormSchemaAPI.getFormSchema(
      this.$store.state.sessionData.form_schema_id
    );
    Object.keys(this.formData.attributes).forEach((field) => {
      this.formData.attributes[field]["component"] =
        typeToInputParameters[this.formData.attributes[field].type];
    });
    console.log(this.formData);
  },
  watch: {
    userData: {
      handler() {
        this.isUserDataIsComplete();
      },
      deep: true,
    },
  },
  computed: {
    /** returns images to be displayed for a group */
    getGroupImages() {
      return this.$store.state.groupData.input_schema.images;
    },

    /** returns title for the form */
    formTitle() {
      return this.formData.name;
    },

    /** returns all fields to be displayed in the form */
    formFields() {
      return this.formData.attributes;
    },

    /** whether redirection button is disabled */
    isRedirectionButtonDisabled() {
      return this.userData["user_id"] == "";
    },

    /** returns if ID needs to be generated */
    idGeneration() {
      return this.$store.state.sessionData.id_generation;
    },

    /** returns if redirection is necessary */
    redirection() {
      return this.$store.state.sessionData.redirection == null
        ? true
        : this.$store.state.sessionData.redirection;
    },
  },
  methods: {
    getOptions(field) {
      if (field.dependant) {
        if (this.userData[field.dependantField])
          return field.dependantFieldMapping[
            this.userData[field.dependantField]
          ];
      } else return field.options;
    },

    /** checks if user data has all the fields required */
    isUserDataIsComplete() {
      let isUserDataComplete = true;
      Object.keys(this.formData.attributes).forEach((field) => {
        if (
          !this.userData.hasOwnProperty(this.formData.attributes[field].key) ||
          this.formData.attributes[field].key == ""
        ) {
          isUserDataComplete = false;
        }
      });

      return isUserDataComplete
        ? (this.signUpDisabled = false)
        : (this.signUpDisabled = true);
    },

    /** updates user data based on user input */
    updateUserData(value, key) {
      this.userData[key] = value;
    },

    /** creates user ID based on information */
    async signUp() {
      this.formSubmitted = true;
      this.isLoading = true;

      let createdUserId = await UserAPI.userSignup(
        this.userData,
        this.$store.state.sessionData.id_generation,
        this.$store.state.groupData.input_schema.userType
      );

      if (createdUserId == "" || createdUserId.error) {
        this.$router.push({
          name: "Error",
          state: {
            type: "500",
            text: "ID could not be created. Please contact your program manager.",
          },
        });
      }
      this.isLoading = false;
      this.userData["user_id"] = createdUserId ? createdUserId : "";
    },

    /** redirects to destination */
    redirect() {
      if (
        redirectToDestination(
          this.$store.state.sessionData.purpose.params,
          this.userData["user_id"],
          this.$store.state.sessionData.platform_id,
          this.$store.state.sessionData.platform,
          this.$store.state.groupData.input_schema.userType
        )
      ) {
        sendSQSMessage(
          "sign-up",
          this.$store.state.sessionData.purpose["sub-type"],
          this.$store.state.sessionData.platform,
          this.$store.state.sessionData.platform_id,
          this.userData["user_id"],
          this.getAuthTypes,
          this.$store.state.groupData.name,
          this.$store.state.groupData.input_schema.userType,
          this.$store.state.sessionData.session_id,
          "",
          "",
          this.$store.state.sessionData.meta_data.batch
        );
      }
    },
  },
};
</script>
