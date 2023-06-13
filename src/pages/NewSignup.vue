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

  <div
    v-if="!formSubmitted"
    class="flex flex-col my-auto h-full pt-12 pb-10 space-y-3"
  >
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
        Your ID is <b>{{ studentId }}</b>
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
import formData from "../components/formData.json";
import { typeToInputParameters } from "../services/authToInputParameters";
import { redirectToDestination } from "../services/redirectToDestination";
import UserAPI from "@/services/API/user.js";

export default {
  name: "SignUp",
  data() {
    return {
      isLoading: false,
      userData: {},
      formSubmitted: false,
      signUpDisabled: true,
    };
  },
  watch: {
    userData: {
      handler() {
        console.log(this.userData);
        this.isUserDataIsComplete();
      },
      deep: true,
    },
  },
  computed: {
    /** returns images to be displayed for a group */
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    /** returns title for the form */
    formTitle() {
      return formData.title;
    },
    /** returns all fields to be displayed in the form */
    formFields() {
      return formData.fields.map((field) => {
        return {
          ...field,
          component: typeToInputParameters[field.type],
        };
      });
    },

    /** whether redirection button is disabled */
    isRedirectionButtonDisabled() {
      return this.userData["user_id"] == "";
    },
    /** returns if ID needs to be generated */
    idGeneration() {
      return this.$store.state.sessionData.idGeneration;
    },
    /** returns if redirection is necessary */
    redirection() {
      return this.$store.state.sessionData.redirection;
    },
  },
  methods: {
    /** checks if user data has all the fields required */
    isUserDataIsComplete() {
      let isUserDataComplete = true;
      Object.keys(formData.fields).forEach((field) => {
        if (
          !this.userData.hasOwnProperty(formData.fields[field].key) ||
          this.userData[formData.fields[field].key] == ""
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
        this.$store.state.sessionData.idGeneration
      );

      if (userId == "") {
        this.$router.push({
          name: "Error",
          state: {
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
          this.$store.state.sessionData.purposeParams,
          this.userData["user_id"],
          this.$store.state.sessionData.redirectPlatformParams.id,
          this.$store.state.sessionData.redirectPlatform,
          this.$store.state.groupData.userType
        )
      ) {
        sendSQSMessage(
          this.$store.state.sessionData.purpose,
          this.$store.state.sessionData.purposeParams,
          this.$store.state.sessionData.redirectPlatform,
          this.$store.state.sessionData.redirectPlatformParams.id,
          this.userData,
          this.getAuthTypes,
          this.this.$store.state.sessionData.group,
          this.$store.state.groupData.userType,
          this.$store.state.sessionData.sessionId,
          this.$store.state.sessionData.userIpAddress,
          this.$store.state.sessionData.batch
        );
      }
    },
  },
};
</script>
