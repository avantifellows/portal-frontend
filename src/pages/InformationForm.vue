<template>
  <div
    class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <LanguagePicker />
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-10 w-auto" :src="AFLogo" />
      <h2
        class="mt-6 text-center text-xl font-bold leading-9 tracking-tight text-gray-900"
      >
        Please fill in some of your details!
      </h2>
    </div>

    <div class="mx-auto w-2/3 md:w-auto">
      <component
        class=""
        v-for="(formField, index) in formSchemaData"
        :show="formField.show"
        :key="index"
        :is="formField.component"
        :label="formField.label[getLocale]"
        :isRequired="formField.required"
        :dbKey="formField.key"
        :placeholder="formField.placeholder"
        :options="formField.options"
        :multiple="formField.multiple"
        :maxLengthOfEntry="formField.maxLengthOfEntry"
        :helpText="formField.helpText[getLocale]"
        @update="updateUserData"
      />

      <button
        class="bg-primary mx-auto hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg p-4 rounded disabled:opacity-50 btn"
        :disabled="buttonDisabled"
        @click="profileDetails"
      >
        START SESSION
      </button>
    </div>
  </div>
</template>
<script>
import useAssets from "@/assets/assets.js";
import FormSchemaAPI from "@/services/API/form.js";
import UserAPI from "@/services/API/user.js";
import { typeToInputParameters } from "@/services/authToInputParameters";
import { redirectToDestination } from "@/services/redirectToDestination";
import { sendSQSMessage } from "@/services/API/sqs";
import LanguagePicker from "../components/LanguagePicker.vue";
import { useToast } from "vue-toastification";

const assets = useAssets();

export default {
  name: "Information Form",
  components: { LanguagePicker },
  data() {
    return {
      AFLogo: assets.AFLogoSvg,
      formSchemaData: {}, // contains data about the form schema
      buttonDisabled: true,
      userData: {}, // contains data entered by user
      toast: useToast(),
    };
  },
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  async created() {
    /** Fetches all the fields that need to be filled by the student
    /* Also, maps each field to its input component
    */
    this.formSchemaData = await FormSchemaAPI.getFormFields(
      this.$store.state.sessionData.number_of_fields_in_pop_form,
      this.$store.state.groupData.name,
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
    if (Object.keys(this.formSchemaData).length == 0) {
      this.buttonDisabled = false;
    }
    Object.keys(this.formSchemaData).forEach((field) => {
      this.formSchemaData[field]["component"] =
        typeToInputParameters[this.formSchemaData[field].type];
      this.formSchemaData[field]["show"] =
        this.formSchemaData[field].showBasedOn == "" ? true : false;
      this.formSchemaData[field]["required"] =
        this.formSchemaData[field].required == "TRUE" ? true : false;
    });
  },
  watch: {
    userData: {
      handler() {
        this.isUserDataIsComplete();
        this.getOptions();
        this.showBasedOn();
      },
      deep: true,
    },
  },
  computed: {
    getLocale() {
      return this.$store.state.language;
    },
  },
  methods: {
    showBasedOn() {
      return Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];
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
    getOptions() {
      Object.keys(this.formSchemaData).forEach((field) => {
        let fieldAttributes = this.formSchemaData[field];

        if (fieldAttributes.dependant) {
          if (this.userData[fieldAttributes.dependantField]) {
            fieldAttributes["options"] =
              fieldAttributes.dependantFieldMapping[
                this.userData[fieldAttributes.dependantField]
              ];
          }
        } else {
          return fieldAttributes.options[this.getLocale];
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
      await UserAPI.studentData(
        this.userData,
        (this.userData["student_id"] = this.id)
      );
      this.redirect();
    },

    /** redirects to destination */
    redirect() {
      if (
        redirectToDestination(
          this.$store.state.sessionData.purpose.params,
          this.id,
          this.$store.state.sessionData.platform_id,
          this.$store.state.sessionData.platform,
          this.$store.state.groupData.input_schema.userType
        )
      ) {
        sendSQSMessage(
          "attendance",
          this.$store.state.sessionData.purpose["sub-type"],
          this.$store.state.sessionData.platform,
          this.$store.state.sessionData.platform_id,
          this.id,
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
  },
};
</script>
