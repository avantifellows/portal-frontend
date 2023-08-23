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
    :class="{ 'opacity-20 pointer-events-none': isLoading }"
  >
    <template v-for="(image, index) in getGroupImages" :key="index">
      <img :src="image" />
    </template>
  </div>

  <div class="flex flex-col my-auto items-center h-full pt-12 pb-10 space-y-3">
    <FormKit
      type="form"
      :config="{ validationVisibility: 'submit' }"
      @submit="submitForm"
    >
      <FormKit type="group" v-model="dateOfBirth" name="dob">
        <div class="flex flex-row space-x-5">
          <FormKit
            type="select"
            name="day"
            v-model="day"
            label="*Day"
            placeholder="Day"
            :options="dayList"
            validation="required"
            help="Select your Date of Birth."
          />
          <FormKit
            type="select"
            label="*Month"
            name="month"
            v-model="month"
            placeholder="Month"
            :options="monthList"
            validation="required"
          />
          <FormKit
            type="select"
            name="year"
            v-model="year"
            label="*Year"
            placeholder="Year"
            :options="yearList"
            validation="required"
          />
        </div>
      </FormKit>

      <FormKit
        type="select"
        label="*Region"
        placeholder="Select your region"
        :options="[
          'Bhopal',
          'Chandigarh',
          'Hyderabad',
          'Jaipur',
          'Lucknow',
          'Patna',
          'Pune',
          'Shillong',
        ]"
        validation="required"
        name="region"
        v-model="region"
        help="Please select your JNV's region. Example: Shillong"
      />
      <FormKit
        type="select"
        label="*State"
        placeholder="Select your state"
        :options="stateList || []"
        validation="required"
        v-model="stateName"
        name="state"
        help="Please select your JNV's state. Example: Sikkim"
      />

      <FormKit
        type="select"
        label="*School Name"
        placeholder="Select your JNV's name"
        :options="jnvList || []"
        validation="required"
        name="school"
        help="Please select your JNV's name. Example: JNV Bidar"
      />

      <FormKit
        type="select"
        label="*Grade"
        placeholder="Select your grade"
        :options="grades"
        v-model="grade"
        validation="required"
        name="grade"
        help="Select 12 if you are in 12th grade/class"
      />

      <FormKit
        type="tel"
        label="*Phone Number"
        validation="required|matches:/^[0-9]{10}$/"
        validation-visibility="live"
        v-model="phoneNumber"
        name="number"
        help="Please enter the phone number you registered with. Example: 9848022335"
      />
      <button
        v-show="isUserIdEmpty"
        class="mx-auto pb-2 text-md underline text-red-800"
        @click="redirectToSignup"
      >
        You are not registered. Please sign up.
      </button>
    </FormKit>

    <div
      v-if="formSubmitted"
      class="w-5/6 lg:w-1/2 mx-auto flex flex-col bg-peach text-center mt-20 shadow-sm justify-evenly text-lg md:text-xl rounded-md p-6 space-y-6"
    >
      <template v-if="!isNotStudentRegistration">
        <p>
          Your Student ID is <b>{{ studentId }}</b>
        </p>
        <p>Please note this down. Use this to sign-in going forward.</p>
      </template>

      <button
        v-if="!isPurposeRegistration"
        @click="redirect"
        :disabled="isTakeTestDisabled"
        class="bg-primary hover:bg-primary-hover text-white font-bold shadow-xl uppercase text-lg mx-auto p-2 rounded disabled:opacity-50 btn"
      >
        Take Test
      </button>
    </div>
  </div>
</template>
<script>
import { jnvState, regionState } from "@/services/regionToJnvMapping.js";
import UserAPI from "@/services/API/user.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import useAssets from "@/assets/assets.js";
import InstructionsMapping from "@/components/InstructionsMapping.vue";
import Candidate from "@/components/Candidate.vue";

const assets = useAssets();
export default {
  name: "Signup",
  components: { InstructionsMapping, Candidate },
  data() {
    return {
      region: "",
      course: "",
      grade: "",
      stateName: "",
      phoneNumber: "",
      dateOfBirth: "",
      month: "",
      day: "",
      year: "",
      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
      formSubmitted: false,
      studentId: "",
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      userId: null,
    };
  },
  created() {
    if (this.$store.state.sessionData.sessionId == null) {
      this.$router.push({ name: "Error" });
    }
  },
  computed: {
    isNotStudentRegistration() {
      return this.$store.state.sessionData.group == "Candidates";
    },
    isFieldOther() {
      return this.field == "Other";
    },
    grades() {
      return this.$store.state.sessionData.sessionId == "JNV10_Form"
        ? ["10"]
        : ["11", "12"];
    },
    isLongForm() {
      return this.$store.state.sessionData.isLongForm;
    },
    isStreamScience() {
      return this.stream == "Science";
    },
    // Returns the corresponding states for a region
    stateList() {
      return regionState[this.region];
    },
    // Returns the corresponding JNVs for a state
    jnvList() {
      return jnvState[this.stateName];
    },
    // Returns the corresponding streams for a selected course
    streamList() {
      if (this.course == "JEE") {
        return ["PCM", "PCMB"];
      } else {
        return ["PCB", "PCMB"];
      }
    },
    // Returns the images stored against a group
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    isTakeTestDisabled() {
      return this.studentId == "" && this.userId == "";
    },
    isPurposeRegistration() {
      return (
        this.$store.state.sessionData.purpose == "registration" &&
        this.$store.state.sessionData.sessionId != "JNV10_Form" &&
        this.$store.state.sessionData.group != "Candidates"
      );
    },
    isUserIdEmpty() {
      return this.userId == "";
    },
  },
  methods: {
    // Called after form is submitted, returns API response containing generated ID
    async submitForm(formData) {
      let dateOfBirth =
        (this.month > 9 ? this.month : "0" + this.month) +
        "-" +
        (this.day > 9 ? this.day : "0" + this.day) +
        "-" +
        this.year;
      this.userId = await UserAPI.verifyAIETStudent({
        phone_number: formData.number,
        alternate_number: formData.number,
        school_name: formData.school,
        date_of_birth: dateOfBirth,
        grade: formData.grade,
      });
      console.log(this.userId == "");
    },

    redirect() {
      if (
        redirectToDestination(
          this.$store.state.sessionData.purposeParams,
          this.isNotStudentRegistration
            ? this.userId.toString()
            : this.studentId.toString(),
          this.$store.state.sessionData.redirectPlatformParams.id,
          this.$store.state.sessionData.redirectPlatform,
          this.$store.state.groupData.authType,
          this.$store.state.sessionData.group
        )
      ) {
        sendSQSMessage(
          this.$store.state.sessionData.purpose,
          this.$store.state.sessionData.purposeParams,
          this.$store.state.sessionData.redirectPlatform,
          this.$store.state.sessionData.redirectPlatformParams.id,
          this.isNotStudentRegistration
            ? this.userId.toString()
            : this.studentId.toString(),
          this.$store.state.groupData.authType,
          this.$store.state.sessionData.group,
          this.$store.state.groupData.userType,
          this.$store.state.sessionData.sessionId,
          this.$store.state.sessionData.userIp,
          this.phoneNumber,
          this.$store.state.sessionData.batch,
          this.dateOfBirth
        );
      }
    },
    redirectToSignup() {
      this.$router.push({
        name: "Signup",
      });
    },
  },
};
</script>
