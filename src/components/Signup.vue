<template>
  <div class="h-full">
    <div class="flex w-full h-10 justify-evenly md:w-5/6 md:h-20 xl:w-3/4 mx-auto mt-20">
      <template v-for="(image, index) in getGroupImages" :key="index">
        <img :src="image" />
      </template>
    </div>
    <div class="flex flex-col items-center justify-center p-10" v-if="!formSubmitted">
      <p
        class="text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center mb-5"
      >
        PORTAL - SIGN UP
      </p>

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
        <FormKit
          type="text"
          label="*Father's Name"
          validation="required|alpha_spaces|length:3,40"
          name="father_name"
          validation-visibility="live"
          help="Enter your father's full name."
        />
        <FormKit
          type="text"
          label="*Mother's Name"
          validation="required|alpha_spaces|length:3,40"
          name="mother_name"
          validation-visibility="live"
          help="Enter your mother's full name."
        />
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
            'Avanti',
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
        <FormKit
          type="select"
          label="*Course"
          placeholder="Which course?"
          :options="['JEE', 'NEET']"
          validation="required"
          v-model="course"
          name="course"
          help="Please select your course: JEE or NEET"
        />
        <FormKit
          type="select"
          label="*Stream"
          placeholder="Select your stream"
          :options="streamList"
          validation="required"
          name="stream"
          help="Please select your stream. Example: PCM (Physics, Chemistry, Math)"
        />
        <FormKit
          type="select"
          label="*Grade"
          placeholder="Select your grade"
          :options="['11', '12']"
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

        <FormKit
          type="tel"
          label="*Family Income per Annum"
          validation="required|number|length:1,10"
          validation-visibility="live"
          name="family_income"
          help="Please enter your family income per annum (year) in digits. Example: 100000"
        />
      </FormKit>
    </div>
    <div
      v-if="formSubmitted"
      class="w-5/6 lg:w-1/2 mx-auto flex flex-col bg-peach text-center mt-20 shadow-sm justify-evenly text-lg md:text-xl rounded-md p-6 space-y-6"
    >
      <p>
        Your Student ID is <b>{{ studentId }}</b>
      </p>
      <p>Please note this down. Use this to sign-in going forward.</p>
      <button
        @click="redirect"
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
import { redirectToDestination } from "@/services/redirectToDestination.js";

export default {
  name: "Signup",
  data() {
    return {
      region: "",
      course: "",
      grade: "",
      stateName: "",
      studentName: "",
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
    };
  },

  computed: {
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
  },
  methods: {
    // Called after form is submitted, returns API response containing generated ID
    async submitForm(formData) {
      this.formSubmitted = true;
      let createdStudentId = await UserAPI.studentSignup(formData);

      this.studentId = createdStudentId ? createdStudentId : "";
    },
    redirect() {
      redirectToDestination(
        this.$store.sessionData.purposeParams,
        this.studentId,
        this.$store.sessionData.redirectPlatformParams.id,
        this.$store.sessionData.redirectPlatform,
        this.$store.groupData.authType,
        this.$store.sessionData.group
      );
    },
  },
};
</script>
