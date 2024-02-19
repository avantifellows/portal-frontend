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
    <div
      class="flex flex-col items-center justify-center p-10"
      v-if="!formSubmitted"
    >
      <p
        class="text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center mb-5"
      >
        Himachal Registration
      </p>

      <FormKit
        type="form"
        :config="{ validationVisibility: 'submit' }"
        @submit="submitForm"
      >
        <FormKit
          type="number"
          label="*Student ID"
          validation="required|number|length:3,40"
          v-model="studentId"
          validation-visibility="live"
          help="Ex: 02784626 (if you have seven or less digits in student ID, please put 0 in the beginning.)"
        />

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
          type="text"
          label="*Father's Name"
          validation="required|alpha_spaces|length:3,40"
          v-model="fatherName"
          validation-visibility="live"
          name="name"
          help="Enter your father's full name. Example: Sudhir Singh Sharma"
        />

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
            />
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
          label="*Grade"
          placeholder="Select your grade"
          :options="['9', '10', '11']"
          validation="required"
          v-model="grade"
          name="grade"
        />

        <FormKit
          type="select"
          label="*Gender"
          placeholder="Select your gender"
          :options="['Female', 'Male', 'Other']"
          validation="required"
          name="gender"
        />

        <FormKit
          type="select"
          label="*Category"
          placeholder="Select your category"
          :options="['Gen', 'Gen-EWS', 'OBC', 'SC', 'ST']"
          validation="required"
          name="category"
          help="Select your category. Example: OBC"
        />

        <FormKit
          type="select"
          label="*Stream"
          placeholder="Select your stream"
          :options="['PCB', 'PCM']"
          validation="required"
          name="stream"
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
          type="email"
          label="Email Address"
          validation="required|email"
          validation-visibility="live"
          name="email"
          help="Enter a valid email address if you have one. Example: karn.mathur@gmail.com"
        />

        <FormKit
          type="tel"
          label="*Student's Personal Contact Number"
          validation="required|matches:/^[0-9]{10}$/"
          validation-visibility="live"
          name="mobile_number"
          help="Preferably whatsapp number"
        />

        <FormKit
          type="tel"
          label="*Parents / Guardian Contact Number"
          validation="required|matches:/^[0-9]{10}$/"
          validation-visibility="live"
          name="parent_mobile_number"
        />

        <FormKit
          type="tel"
          label="*Mobile Number of Subject Teacher (Physics or Chemistry or Mathematics)"
          validation="required|matches:/^[0-9]{10}$/"
          validation-visibility="live"
          name="teacher_mobile_number"
        />

        <FormKit
          type="select"
          label="*District"
          placeholder="Select your district"
          :options="[
            'Bilaspur',
            'Chamba',
            'Hamirpur',
            'Kangra',
            'Kinnaur',
            'Kullu',
            'Lahul And Spiti',
            'Mandi',
            'Shimla',
            'Sirmaur',
            'Solan',
            'Una',
          ]"
          validation="required"
          v-model="district"
          name="district"
        />

        <FormKit
          type="number"
          label="*School Code"
          validation="required|number"
          validation-visibility="live"
          name="school_code"
          help="Ex: 02533 (if you have four or less digits in school id, please put 0 in the beginning.)"
        />

        <FormKit
          type="number"
          label="*School UDISE Code"
          validation="required|number"
          validation-visibility="live"
          name="school_udise_code"
          help="Ex: Please enter UDISE code as mentioned in the given sheet List of school codes"
        />

        <FormKit
          type="text"
          label="*School Name"
          validation="required|alpha_spaces|length:3,40"
          v-model="schoolName"
          validation-visibility="live"
          name="name"
          help="Ex: GSSS Rampur"
        />

        <FormKit
          type="number"
          label="Total Marks Obtained in Previous Year's Final Exam"
          validation="required|number"
          validation-visibility="live"
          name="total_marks"
          help="Ex: 81/100"
        />

        <FormKit
          type="number"
          label="% of Marks Obtained in Mathematics"
          validation="required|number"
          validation-visibility="live"
          name="maths_marks"
          help="Ex: 81/100"
        />

        <FormKit
          type="number"
          label="% of Marks Obtained in Science"
          validation="required|number"
          validation-visibility="live"
          name="science_marks"
          help="Ex: 81/100"
        />

        <FormKit
          type="select"
          label="*Medium of Language"
          placeholder="Medium of Language"
          :options="['English', 'Hindi']"
          validation="required"
          name="language_medium"
        />

        <FormKit
          v-if="grade == '11'"
          type="select"
          label="*Student's Choice of Subjects"
          placeholder="Student's Choice of Subjects"
          :options="['PCB', 'PCM', 'PCMB']"
          validation="required"
          name="choice_of_subjects"
          help="Medical | PCB (Physics, Chemistry, Biology) Non-Medical | PCM (Physics, Chemistry, Mathematics) Both | PCMB"
        />

        <FormKit
          type="select"
          label="*Enrollment in Other Coaching /  Tuition"
          placeholder="Enrollment in Other Coaching /  Tuition"
          :options="['Yes', 'No']"
          validation="required"
          name="enrollment_in_tuition"
        />

        <FormKit
          type="select"
          label="*Area of Interests"
          placeholder="Area of Interests"
          :options="getAreasOfInterests"
          validation="required"
          name="area_of_interest"
        />

        <FormKit
          type="select"
          label="*Father's Education Level"
          placeholder="Father's Education Level"
          :options="[
            'Grades 1-5',
            'Grades 6-10',
            'Grades 11-12',
            'Graduation/Bachelors',
            'Post Graduation/Masters',
            'PhD or equivalent degree',
            'Certificate course',
            'Vocational training',
            'Diploma course',
          ]"
          validation="required"
          name="father_education_level"
        />

        <FormKit
          type="select"
          label="*Father's Profession"
          placeholder="Father's Profession"
          :options="[
            'Self employed (farming, own shop, own work, etc.)',
            'Government service',
            'Private sector - informal (driver, cook, house-help, etc)',
            'Private sector - formal (teacher in a private school, employee at MNC etc)',
            'Not employed',
            'Other',
            'Not applicable/Father passed away',
          ]"
          validation="required"
          name="father_profession"
        />

        <FormKit
          type="select"
          label="*Mother's Education Level"
          placeholder="Mother's Education Level"
          :options="[
            'Grades 1-5',
            'Grades 6-10',
            'Grades 11-12',
            'Graduation/Bachelors',
            'Post Graduation/Masters',
            'PhD or equivalent degree',
            'Certificate course',
            'Vocational training',
            'Diploma course',
          ]"
          validation="required"
          name="mother_education_level"
        />

        <FormKit
          type="select"
          label="*Mother's Profession"
          placeholder="Mother's Profession"
          :options="[
            'Self employed (farming, own shop, own work, etc.)',
            'Government service',
            'Private sector - informal (driver, cook, house-help, etc)',
            'Private sector - formal (teacher in a private school, employee at MNC etc)',
            'Not employed',
            'Other',
            'Not applicable/Mother passed away',
          ]"
          validation="required"
          name="mother_profession"
        />

        <FormKit
          type="select"
          label="*Monthly household income"
          placeholder="Monthly household income"
          :options="[
            'Less than Rs. 10,000',
            'Rs. 10,000-20,000',
            'Rs. 20,000-30,000',
            'Rs. 30,000-40,000',
            'Rs. 40,000-50,000',
            'Rs. 50,000-60,000',
            'Rs. 60,000-70,000',
            'Rs. 70,000-80,000',
            'Rs. 80,000-90,000',
            'Rs. 90,000-100,000',
            'More than Rs. 100,000',
          ]"
          validation="required"
          name="monthly_family_income"
        />

        <FormKit
          type="select"
          label="*Do you go for tuition or other coaching classes?"
          placeholder="Tuition or other coaching classes?"
          :options="[
            'I currently do not go for any tuition or coaching class',
            'I currently go for tuition for school subjects',
            'I currently attend online coaching class to prepare for competitive exams',
            'I currently go for in-person (offline) coaching classes to prepare for competitive exams',
          ]"
          validation="required"
          name="goes_for_tuition_or_other_coaching"
        />
      </FormKit>
    </div>
  </div>
</template>

<script>
import "@formkit/themes/genesis";
import { jnvState, regionState } from "@/services/regionToJnvMapping.js";
import UserAPI from "@/services/API/user.js";
import { sendSQSMessage } from "@/services/API/sqs";
import { redirectToDestination } from "@/services/redirectToDestination.js";
import useAssets from "@/assets/assets.js";

const assets = useAssets();
export default {
  name: "HimachalSignup",
  data() {
    return {
      studentId: "",
      studentName: "",
      fatherName: "",
      month: "",
      day: "",
      year: "",
      dateOfBirth: "",
      grade: "",
      gender: "",
      category: "",
      stream: "",
      physically_handicapped: "",
      email: "",
      mobile_number: "",
      parent_mobile_number: "",
      teacher_mobile_number: "",
      district: "",

      school_code: "",
      school_udise_code: "",
      schoolName: "",
      total_marks: "",
      maths_marks: "",
      science_marks: "",
      language_medium: "",
      choice_of_subjects: "",
      enrollment_in_tuition: "",
      area_of_interest: "",
      father_education_level: "",
      father_profession: "",
      mother_education_level: "",
      mother_profession: "",
      monthly_family_income: "",
      goes_for_tuition_or_other_coaching: "",

      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
      formSubmitted: false,
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
    };
  },
  created() {
    if (this.$store.state.sessionData == null) {
      this.$router.push({ name: "Error" });
    }
  },
  computed: {
    // Returns the images stored against a group
    getGroupImages() {
      return this.$store.state.groupData.images;
    },
    getAreasOfInterests() {
      return this.grade == "11"
        ? ["Engineering", "Medical"]
        : [
            "Engineering",
            "Medical",
            "NDA ( National Defense Academy )",
            "B.A / B.Sc./ B.Com.",
            "Law",
            "Government Job",
            "Teaching",
          ];
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
              this.$store.state.sessionData.userIp,
              this.phoneNumber,
              this.$store.state.sessionData.batch,
              (this.month > 9 ? this.month : "0" + this.month) +
                "-" +
                (this.day > 9 ? this.day : "0" + this.day) +
                "-" +
                this.year
            );
          }
        }
      } else this.studentName = "";
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
          (this.month > 9 ? this.month : "0" + this.month) +
            "-" +
            (this.day > 9 ? this.day : "0" + this.day) +
            "-" +
            this.year
        );
      }
    },
  },
};
</script>
