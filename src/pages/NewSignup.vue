<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <LanguagePicker />
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
    <p class="mt-6 text-center text-black font-bold">
      {{ formTitle }}
    </p>
    <p class="text-center">{{ formSubTitle }}</p>

    <div class="mx-auto w-64">
      <component
        v-for="(formField, index) in formFields"
        :show="formField.show"
        :key="index"
        :is="formField.component"
        :label="formField.label[getLocale]"
        :isRequired="formField.required"
        :dbKey="formField.key"
        :options="formField.options[getLocale]"
        :multiple="formField.multiple"
        :maxLengthOfEntry="formField.maxLengthOfEntry"
        :helpText="formField.helpText[getLocale]"
        @update="updateUserData"
        class="mt-[25px]"
      />

      <!-- submit button -->
      <button
        class="mt-[30px] bg-primary disabled:bg-primary-hover hover:bg-primary-hover text-white mx-auto shadow-md w-full p-2 rounded"
        :disabled="signUpDisabled"
        @click="signUp"
        v-html="signUpButtonLabel"
      />
    </div>
    <div class="mt-[30px] flex w-48 mx-auto justify-between items-center">
      <hr class="w-20 text-grey" />
      <p class="text-grey font-roboto text-sm opacity-40">or</p>
      <hr class="w-20 text-grey" />
    </div>
    <!-- signup button -->
    <button
      @click="redirectToSignIn"
      class="mt-[20px] mx-auto pt-2 text-primary text-base"
      v-html="signInText"
    />
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
      class="mt-[20px] w-full bg-primary disabled:bg-primary-hover hover:bg-primary-hover text-white mx-auto shadow-md p-2 rounded"
      v-html="startSessionText"
    />
  </div>
</template>
<script>
import { typeToInputParameters } from "@/services/authToInputParameters";
import { redirectToDestination } from "@/services/redirectToDestination";
import UserAPI from "@/services/API/user.js";
import FormSchemaAPI from "@/services/API/form.js";
import useAssets from "@/assets/assets.js";
import { sendSQSMessage } from "@/services/API/sqs";
import LanguagePicker from "../components/LanguagePicker.vue";

const assets = useAssets();

export default {
  name: "SignUp",
  components: { LanguagePicker },
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
      this.formData.attributes[field]["show"] =
        this.formData.attributes[field].showBasedOn == "" ? true : false;
      this.formData.attributes[field]["required"] =
        this.formData.attributes[field].required == "TRUE" ? true : false;
    });
  },
  watch: {
    userData: {
      handler() {
        this.isUserDataIsComplete();
        this.showBasedOn();
        this.getOptions();
      },
      deep: true,
    },
  },
  computed: {
    /** Returns button text */
    signUpButtonLabel() {
      return this.getLocale == "en" ? "Sign Up" : "साइन अप";
    },

    /** Returns button text */
    startSessionText() {
      return this.getLocale == "en" ? "Start Session" : "सत्र शुरू करें";
    },

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.language;
    },

    /** Returns text based on locale */
    signInText() {
      return this.getLocale == "en"
        ? "Already Registered? <b> Sign In</b>"
        : "पहले ही रजिस्टर्ड हैं? <b>साइन इन करें। </b>";
    },

    /** returns images to be displayed for a group */
    getGroupImages() {
      return this.$store.state.groupData.input_schema.images;
    },

    /** returns title for the form */
    formTitle() {
      return this.formData.name;
    },

    formSubTitle() {
      return this.formData.sub_heading;
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
    /** Returns if there any fields that have visibilty dependence on any other fields */
    showBasedOn() {
      return Object.keys(this.formData.attributes).forEach((field) => {
        let fieldAttributes = this.formData.attributes[field];
        let showBasedOn = fieldAttributes.showBasedOn;

        if (fieldAttributes.showBasedOn != "") {
          if (
            this.userData[Object.keys(JSON.parse(showBasedOn))] ==
            Object.values(JSON.parse(showBasedOn))
          ) {
            fieldAttributes["show"] = true;
          } else fieldAttributes["show"] = false;
        }
      });
    },

    /** Builds options for dependant fields */
    getOptions() {
      Object.keys(this.formData.attributes).forEach((field) => {
        let fieldAttributes = this.formData.attributes[field];

        if (fieldAttributes.dependant) {
          if (this.userData[fieldAttributes.dependantField]) {
            fieldAttributes["options"] =
              fieldAttributes.dependantFieldMapping[
                this.userData[fieldAttributes.dependantField]
              ];
            return fieldAttributes.options[this.getLocale];
          }
        }
      });
    },

    /** checks if user data has all the fields required */
    isUserDataIsComplete() {
      let isUserDataComplete = true;
      Object.keys(this.formData.attributes).forEach((field) => {
        if (
          (!this.userData.hasOwnProperty(this.formData.attributes[field].key) ||
            this.userData[this.formData.attributes[field].key] == "") &&
          this.formData.attributes[field].required &&
          this.formData.attributes[field].show
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
      sendSQSMessage(
        "sign-up",
        this.$store.state.sessionData.purpose["sub-type"],
        this.$store.state.sessionData.platform,
        this.$store.state.sessionData.platform_id,
        this.userData["student_id"],
        "",
        this.$store.state.groupData.name,
        this.$store.state.groupData.input_schema.userType,
        this.$store.state.sessionData.session_id,
        "",
        "phone" in this.userData ? this.userData["phone"] : "",
        this.$store.state.sessionData.meta_data.batch,
        "date_of_birth" in this.userData ? this.userData["date_of_birth"] : ""
      );
      this.formSubmitted = true;
      this.isLoading = true;

      let createdUserId = await UserAPI.newUserSignup(
        this.userData,
        this.$store.state.sessionData.id_generation,
        this.$store.state.groupData.input_schema.userType,
        this.$store.state.groupData.name
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
          "attendance-sign-up",
          this.$store.state.sessionData.purpose["sub-type"],
          this.$store.state.sessionData.platform,
          this.$store.state.sessionData.platform_id,
          this.userData["user_id"],
          "",
          this.$store.state.groupData.name,
          this.$store.state.groupData.input_schema.userType,
          this.$store.state.sessionData.session_id,
          "",
          "phone" in this.userData ? this.userData["phone"] : "",
          this.$store.state.sessionData.meta_data.batch,
          "date_of_birth" in this.userData ? this.userData["date_of_birth"] : ""
        );
      }
    },

    /**
     * Redirects the user to the sign-in page.
     */
    redirectToSignIn() {
      this.$router.push({
        name: "NewSignin",
      });
    },
  },
};
</script>
