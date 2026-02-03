<template>
  <div v-if="isSubmitting" class="fixed inset-0 z-50 bg-white bg-opacity-60">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <!-- Auto-redirect State -->
  <div
    v-else-if="isAutoRedirecting"
    class="flex flex-col items-center justify-center min-h-screen"
  >
    <div class="text-center">
      <inline-svg
        class="text-primary text-4xl m-auto animate-spin h-16 w-16 mb-6"
        :src="loadingSpinnerSvg"
      />
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {{ getLocale === "en" ? "Profile Complete!" : "प्रोफाइल पूर्ण!" }}
      </h2>
      <p class="text-gray-600">
        {{
          getLocale === "en"
            ? "Your profile is already complete. Redirecting to your session..."
            : "आपकी प्रोफाइल पहले से पूर्ण है। सत्र पर पुनर्निर्देशित कर रहे हैं..."
        }}
      </p>
    </div>
  </div>

  <!-- Form Content -->
  <div v-else class="">
    <LocalePicker :options="getLocaleOptions" />
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-black font-bold">
        {{ getFormHeading }}
      </h2>
    </div>

    <div class="mx-auto w-64">
      <component
        v-for="(formField, index) in formSchemaData"
        :show="formField.show"
        :key="index"
        :is="formField.component"
        :label="formField.label[getLocale]"
        :isRequired="formField.required"
        :multipleSelect="formField.multipleSelect === true"
        :dbKey="formField.key"
        :defaultValue="formField.defaultValue"
        :options="formField.options[getLocale]"
        :multiple="formField.multiple"
        :maxLengthOfEntry="formField.maxLengthOfEntry"
        :helpText="formField.helpText[getLocale]"
        @update="updateUserData"
        class="mt-[25px]"
      />

      <button
        class="mt-[20px] w-full bg-primary disabled:bg-primary-hover hover:bg-primary-hover text-white mx-auto shadow-md p-2 rounded"
        :disabled="buttonDisabled || isSubmitting"
        @click="profileDetails"
        v-html="startSessionText"
      />
    </div>
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";
import FormSchemaAPI from "@/services/API/form.js";
import TokenAPI from "@/services/API/token";
import UserAPI from "@/services/API/user.js";
import { typeToInputParameters } from "@/services/authToInputParameters";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";
import LocalePicker from "../components/LocalePicker.vue";
import { useToast } from "vue-toastification";

const assets = useAssets();

export default {
  name: "Information Form",
  components: { LocalePicker },
  data() {
    return {
      AFLogo: assets.AFLogoSvg,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      formSchemaData: {}, // contains data about the form schema
      buttonDisabled: true,
      userData: {}, // contains data entered by user
      toast: useToast(),
      contextChecked: false, // Track if we've checked for store context
      isLoading: true, // Show loading state initially
      isSubmitting: false,
      isAutoRedirecting: false, // Track if we're auto-redirecting due to empty form
    };
  },
  props: {
    id: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      default: "",
    },
  },
  async created() {
    // Check if we have the required store context (lost on refresh)
    const hasAuthContext =
      this.$store.state.authGroupData &&
      Object.keys(this.$store.state.authGroupData).length > 0;
    const hasSessionContext =
      this.$store.state.sessionData &&
      Object.keys(this.$store.state.sessionData).length > 0;
    const sessionlessPlatforms = ["gurukul", "report", "teacher-web-app"];
    const platform = this.$store.state.platform || this.$route.query.platform;
    const isSessionlessFlow =
      !this.sessionId && platform && sessionlessPlatforms.includes(platform);

    if (!hasAuthContext || (!hasSessionContext && !isSessionlessFlow)) {
      // Context lost (likely due to page refresh) - redirect to error
      this.$router.push({
        name: "Error",
        props: {
          text: "Session expired. Please start from the beginning by accessing your sign-in link again.",
        },
      });
      return;
    }

    // Mark context as checked so template can render safely
    this.contextChecked = true;

    /** Fetches all the fields that need to be filled by the student
    /* Also, maps each field to its input component
    */
    const sessionData = this.$store.state.sessionData || {};
    const metaData = sessionData.meta_data || {};
    const numberOfFields = metaData.number_of_fields_in_popup_form ?? 5; // sessionless fallback
    const popupFormId =
      sessionData.popup_form_id || this.$route.query.popup_form_id || "";

    this.formSchemaData = await FormSchemaAPI.getFormFields(
      numberOfFields,
      popupFormId,
      this.id
    );
    if (this.formSchemaData.error) {
      this.toast.error("Unable to fetch form!", {
        position: "top-center",
        timeout: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      });
    }
    Object.keys(this.formSchemaData).forEach((field) => {
      this.formSchemaData[field]["component"] =
        typeToInputParameters[this.formSchemaData[field].type];
      this.formSchemaData[field]["show"] =
        this.formSchemaData[field].showBasedOn == "" &&
        !this.formSchemaData[field].dependant
          ? true
          : false;
      this.formSchemaData[field]["required"] =
        this.formSchemaData[field].required == "TRUE" ? true : false;
      this.formSchemaData[field]["multipleSelect"] =
        this.formSchemaData[field].multipleSelect == "TRUE" ? true : false;
    });

    this.showBasedOn();

    if (this.shouldAutoRedirect()) {
      this.isAutoRedirecting = true;
      this.isLoading = false;

      // Small delay to show the redirect message, then redirect
      setTimeout(() => {
        this.redirect();
      }, 500);
      return;
    }

    this.isUserDataIsComplete();

    // Form loaded successfully, stop loading
    this.isLoading = false;
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
    getLocaleOptions() {
      return this.$store.state.authGroupData &&
        this.$store.state.authGroupData.locale
        ? this.$store.state.authGroupData.locale.split(",")
        : ["English"];
    },

    /** Returns the locale selected by user */
    getLocale() {
      return this.$store.state.locale;
    },

    getFormHeading() {
      const formHeading = {
        en: "Complete your Profile",
        hi: "अपनी प्रोफाइल पूर्ण करें",
      };

      return formHeading[this.getLocale];
    },

    /** Returns button text */
    startSessionText() {
      return this.getLocale == "en" ? "Start Session" : "सत्र शुरू करें";
    },
  },
  beforeRouteLeave(to, from, next) {
    // example: when you click back button on your browser
    TokenAPI.deleteCookies();
    next();
  },
  methods: {
    /** Determine if user should skip directly to destination (no fields to show). */
    shouldAutoRedirect() {
      const fields = Object.values(this.formSchemaData || {});
      if (fields.length === 0) {
        return true;
      }

      return !fields.some((field) => field.show);
    },

    /** Returns if there any fields that have visibilty dependence on any other fields */
    showBasedOn() {
      return Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];
        let showBasedOn = fieldAttributes.showBasedOn;

        if (fieldAttributes.showBasedOn != "") {
          if (
            this.userData[showBasedOn.split("==")[0]] ==
            showBasedOn.split("==")[1]
          ) {
            fieldAttributes["show"] = true;
          } else fieldAttributes["show"] = false;
        }
        if (fieldAttributes.dependant) {
          if (
            fieldAttributes.dependantField in this.userData &&
            this.userData[fieldAttributes.dependantField] != ""
          ) {
            fieldAttributes["show"] = true;
          } else {
            fieldAttributes["show"] = false;
          }
        }
      });
    },

    /** Builds options for dependant fields */
    getOptions() {
      Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];
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
      Object.keys(this.formSchemaData).forEach((field) => {
        if (
          (!this.userData.hasOwnProperty(this.formSchemaData[field].key) ||
            this.userData[this.formSchemaData[field].key] == "") &&
          this.formSchemaData[field].required &&
          this.formSchemaData[field].show
        ) {
          isUserDataComplete = false;
        }
      });

      return isUserDataComplete
        ? (this.buttonDisabled = false)
        : (this.buttonDisabled = true);
    },

    /** updates user data based on user input */
    updateUserData(value, key) {
      this.userData[key] = value;
    },
    async profileDetails() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      try {
        this.userData["user_id"] = this.id;
        await UserAPI.completeProfile(this.userData);
        this.redirect();
      } finally {
        this.isSubmitting = false;
      }
    },

    /** redirects to destination */
    redirect() {
      const redirected = redirectToDestination(
        this.id,
        this.userData?.display_id || null,
        this.$store.state.omrMode,
        this.$store.state.abTestId,
        this.$store.state.platform_id,
        this.$store.state.platform_link,
        this.$store.state.platform,
        this.$store.state.authGroupData.name,
        this.$store.state.sessionData &&
          this.$store.state.sessionData.meta_data &&
          this.$store.state.sessionData.meta_data.test_type,
        this.$route.query.testType
      );

      if (redirected) {
        const sessionData = this.$store.state.sessionData || {};
        const sessionId =
          sessionData.session_id ||
          sessionData.sessionId ||
          this.$route.query.sessionId ||
          "";
        const sessionOccurrenceId = sessionData.session_occurrence_id || "";

        if (sessionId) {
          UserAPI.postUserSessionActivity(
            this.id,
            "popup_form",
            sessionId,
            this.$store.state.authGroupData.input_schema.user_type,
            sessionOccurrenceId
          );
        }

        sendSQSMessage(
          "popup_form",
          "", // deprecated sub_type
          this.$store.state.platform,
          this.$store.state.platform_id,
          this.id,
          "",
          this.$store.state.authGroupData.name,
          this.$store.state.authGroupData.input_schema.user_type,
          sessionId,
          "phone" in this.userData ? this.userData["phone"] : "",
          sessionData.meta_data ? sessionData.meta_data.batch : "",
          "date_of_birth" in this.userData ? this.userData["date_of_birth"] : ""
        );
      }
    },
  },
};
</script>
