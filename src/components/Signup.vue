<template>
  <div v-if="isLoading" class="h-full w-full fixed z-50">
    <div class="flex mx-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>
  <div class="h-full" :class="{ 'opacity-20': isLoading }">
    <div
      class="flex w-full h-10 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20"
    >
      <template v-for="(image, index) in getGroupImages" :key="index">
        <img :src="image" />
      </template>
    </div>
    <template v-if="!isPurposeRegistration">
      <div
        class="box-border bg-gray-100 rounded-lg p-6 mt-5 text-sm lg:text-md mx-auto w-11/12"
      >
        <InstructionsMapping
          :isStudent="!isNotStudentRegistration"
          :isPurposeRegistration="isPurposeRegistration"
        />
      </div>
    </template>
    <div
      class="flex flex-col items-center justify-center p-10"
      v-if="!formSubmitted"
    >
      <p
        class="text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center mb-5"
      >
        {{ this.$store.state.groupData.signUpFormTitle }}
      </p>
      <template v-if="isNotStudentRegistration">
        <Candidate
          :isPurposeRegistration="isPurposeRegistration"
          :isTakeTestDisabled="isTakeTestDisabled"
          @submitForm="submitForm"
        />
      </template>
      <template v-else>
        <FormKit
          type="form"
          :config="{ validationVisibility: 'submit' }"
          @submit="submitForm"
        >
          <FormKit
            type="text"
            label="*Name"
            validation="required|alpha_spaces|length:3,40"
            v-model="studentName"
            validation-visibility="live"
            name="name"
            help="Enter your full name. Example: Karn Mathur"
          />
          <FormKit
            type="select"
            label="*Gender"
            placeholder="Select your gender"
            :options="['Male', 'Female', 'Other']"
            validation="required"
            name="gender"
            help="Select your gender."
          />
          <FormKit type="group" v-model="dateOfBirth" name="dob">
            <div class="flex flex-row space-x-5">
              <FormKit
                type="select"
                label="*Month"
                name="month"
                v-model="month"
                placeholder="Month"
                :options="monthList"
                validation="required"
                help="Select your Date of Birth."
              />
              <FormKit
                type="select"
                name="day"
                v-model="day"
                label="*Day"
                placeholder="Day"
                :options="dayList"
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
          <template v-if="isLongForm"
            ><FormKit
              type="text"
              label="*Father's Name"
              validation="required|alpha_spaces|length:3,40"
              name="father_name"
              validation-visibility="live"
              help="Enter your father's full name." />
            <FormKit
              type="text"
              label="*Mother's Name"
              validation="required|alpha_spaces|length:3,40"
              name="mother_name"
              validation-visibility="live"
              help="Enter your mother's full name."
          /></template>
          <FormKit
            type="select"
            label="*Category"
            placeholder="Select your category"
            :options="['General', 'General-EWS', 'OBC', 'SC', 'ST']"
            validation="required"
            name="category"
            help="Select your category. Example: OBC"
          />
          <FormKit
            type="select"
            label="*Physically Handicapped"
            placeholder="Physically handicapped?"
            :options="['Yes', 'No']"
            validation="required"
            name="physically_handicapped"
            help="Please select Yes if you are physically handicapped"
          />
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
            type="text"
            label="*City/Town"
            validation="required|alpha_spaces|length:3,30"
            validation-visibility="live"
            name="city"
            help="Enter your city's name. Example: Hyderabad"
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
          <template v-if="isLongForm"
            ><FormKit
              type="select"
              label="*Course"
              placeholder="Which course?"
              :options="['JEE', 'NEET']"
              validation="required"
              v-model="course"
              name="course"
              help="Please select your course: JEE or NEET" />
            <FormKit
              type="select"
              label="*Stream"
              placeholder="Select your stream"
              :options="streamList"
              validation="required"
              name="stream"
              help="Please select your stream. Example: PCM (Physics, Chemistry, Math)"
          /></template>
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
            type="email"
            label="Email Address"
            validation="email"
            validation-visibility="live"
            name="email"
            help="Enter a valid email address if you have one. Example: karn.mathur@gmail.com"
          />

          <FormKit
            type="tel"
            label="*Phone Number"
            validation="required|matches:/^[0-9]{10}$/"
            validation-visibility="live"
            v-model="phoneNumber"
            name="number"
            help="Please enter a valid mobile number. Example: 9848022335"
          />
          <template v-if="!isLongForm">
            <FormKit
              type="tel"
              label="*Alternate Phone Number (Whatsapp)"
              validation="required|matches:/^[0-9]{10}$/"
              validation-visibility="live"
              v-model="alternatePhoneNumber"
              name="alternate_number"
              help="Please enter a valid mobile number. Example: 9848022335"
            />
            <FormKit
              type="select"
              label="*Aspiring Stream post 10th"
              placeholder="Select your stream"
              :options="['Humanity', 'Commerce', 'Science']"
              validation="required"
              name="stream"
              v-model="stream"
              help="Please select your stream. Example: PCM (Physics, Chemistry, Math)"
            />
            <template v-if="isStreamScience">
              <FormKit
                type="select"
                label="*Aspiring field"
                placeholder="Select your field"
                :options="[
                  'Engineering',
                  'Medical',
                  'Agriculture',
                  'NDA',
                  'Other',
                ]"
                validation="required"
                v-model="field"
                name="field"
                help="Please select your field"
              />
              <template v-if="isFieldOther">
                <FormKit
                  type="text"
                  label="*Other field"
                  validation="required|alpha_spaces|length:3,40"
                  v-model="subField"
                  validation-visibility="live"
                  name="sub_field"
                  help="Mention field"
                />
              </template>
            </template>
          </template>

          <template v-if="isLongForm"
            ><FormKit
              type="tel"
              label="*Family Income per Annum"
              validation="required|number|matches:/[1-9]\d*$/"
              validation-visibility="live"
              name="family_income"
              help="Please enter your family income per annum (year) in digits. Example: 100000"
          /></template>
        </FormKit>
      </template>
    </div>
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
      studentName: "",
      phoneNumber: "",
      alternatePhoneNumber: "",
      dateOfBirth: "",
      month: "",
      day: "",
      year: "",
      stream: "",
      field: "",
      subField: "",
      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
      formSubmitted: false,
      studentId: "",
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
      userId: "",
    };
  },
  created() {
    if (this.$store.state.sessionData.sessionId == null) {
      this.$router.push({ name: "Error" });
    }
  },
  computed: {
    isNotStudentRegistration() {
      return this.$store.state.sessionData.group == "Users";
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
        this.$store.state.sessionData.group != "Users"
      );
    },
  },
  methods: {
    // Called after form is submitted, returns API response containing generated ID
    async submitForm(formData) {
      if (formData.name.trim().length > 0) {
        this.formSubmitted = true;
        this.isLoading = true;
        if (this.isNotStudentRegistration) {
          let userId = await UserAPI.userSignup(formData);
          this.userId = userId;

          this.isLoading = false;
        } else {
          let createdStudentId = await UserAPI.studentSignup(formData);
          if (createdStudentId == "") {
            this.$router.push({
              name: "Error",
              state: {
                text: "Student ID could not be created. Please contact your program manager.",
              },
            });
          }
          this.isLoading = false;
          this.studentId = createdStudentId ? createdStudentId : "";
          if (this.isPurposeRegistration) {
            sendSQSMessage(
              this.$store.state.sessionData.purpose,
              this.$store.state.sessionData.purposeParams,
              this.$store.state.sessionData.redirectPlatform,
              this.$store.state.sessionData.redirectPlatformParams.id,
              this.studentId.toString(),
              this.$store.state.groupData.authType,
              this.$store.state.sessionData.group,
              this.$store.state.groupData.userType,
              this.$store.state.sessionData.sessionId,
              this.$store.state.sessionData.userIp
            );
          }
        }
      } else this.studentName = "";
    },
  },
  redirect() {
    if (
      redirectToDestination(
        this.$store.state.sessionData.purposeParams,
        this.studentId.toString(),
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
        this.studentId.toString(),
        this.$store.state.groupData.authType,
        this.$store.state.sessionData.group,
        this.$store.state.groupData.userType,
        this.$store.state.sessionData.sessionId,
        this.$store.state.sessionData.userIp
      );
    }
  },
};
</script>
