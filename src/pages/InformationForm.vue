<template>
  <div
    class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
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

const assets = useAssets();

export default {
  name: "Information Form",
  data() {
    return {
      AFLogo: assets.AFLogoSvg,
      formSchemaData: {}, // contains data about the form schema
      buttonDisabled: true,
      userData: {}, // contains data entered by user
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
      this.$store.state.sessionData.meta_data.number_of_fields_in_pop_up_form,
      this.$store.state.groupData.name,
      this.id
    );
    console.log(this.formSchemaData);
    if (Object.keys(this.formSchemaData).length == 0) {
      this.redirect();
    }
    Object.keys(this.formSchemaData).forEach((field) => {
      this.formSchemaData[field]["component"] =
        typeToInputParameters[this.formSchemaData[field].type];
    });
  },
  watch: {
    userData: {
      handler() {
        this.isUserDataIsComplete();
      },
      deep: true,
    },
  },
  methods: {
    getOptions(field) {
      /** Gets dropdown options for a field that is dependant on the value of another field */
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
      Object.keys(this.formSchemaData).forEach((field) => {
        if (
          !this.userData.hasOwnProperty(this.formSchemaData[field].key) ||
          this.userData[this.formSchemaData[field].key] == ""
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
          "",
          this.$store.state.sessionData.meta_data.batch
        );
      }
    },
  },
};
</script>
