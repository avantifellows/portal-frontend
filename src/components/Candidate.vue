<template>
  <FormKit
    type="form"
    :config="{ validationVisibility: 'submit' }"
    @submit="submitForm"
  >
    <FormKit
      type="text"
      label="*Name"
      validation="required|alpha_spaces|length:3,40"
      v-model="candidateName"
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
    <FormKit
      type="select"
      label="*Degree"
      placeholder="Select your degree"
      :options="['B.Tech', 'BE', 'M.Tech', 'ME', 'B.Sc', 'M.Sc', 'Int. M.Sc']"
      validation="required"
      name="degree"
      help="Select your degree"
    />
    <FormKit
      type="select"
      label="*College/University"
      placeholder="Select your college/university"
      :options="[
        'NIT Warangal',
        'NIT Rourkela',
        'NITK Surathkal',
        'Central University of Karnataka',
      ]"
      validation="required"
      name="college"
      help="Select your college/university"
    />
    <FormKit
      type="select"
      label="*Branch/Department"
      placeholder="Select your branch/department"
      :options="branch"
      validation="required"
      name="branch"
      help="Select your branch/department"
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
      type="number"
      label="*Latest CGPA"
      validation="required|min:0|max:10.0"
      validation-visibility="live"
      v-model="cgpa"
      name="cgpa"
      step="0.1"
      help="Please enter a valid CGPA. Example: 7.5"
    />
    <FormKit
      type="select"
      label="*Home State"
      placeholder="Select your home state"
      :options="states"
      validation="required"
      name="state"
      help="Select your home state"
    />
    <FormKit
      type="select"
      label="*Preferred Teaching Subject"
      placeholder="Select your subject"
      v-model="subject"
      :options="['Physics', 'Chemistry', 'Biology', 'Mathematics']"
      validation="required"
      name="subject"
      help="Select your preferred teaching
    subject"
    />
  </FormKit>
</template>
<script>
export default {
  name: "CandidateHiring",
  props: {
    isPurposeRegistration: {
      type: Boolean,
    },
    isTakeTestDisabled: {
      type: Boolean,
    },
  },
  data() {
    return {
      candidateName: "",
      phoneNumber: "",
      cgpa: "",
      states: [
        "Andaman and Nicobar Islands",
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chandigarh",
        "Chhattisgarh",
        "Dadra and Nagar Haveli",
        "Daman and Diu",
        "Delhi",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Ladakh",
        "Lakshadweep",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Puducherry",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
      ],
      subject: "",
      branch: [
        "Aerospace Engineering",
        "Biotechnology",
        "Chemical Engineering",
        "Civil Engineering",
        "Computer Science Engineering",
        "Electrical Engineering",
        "Electrical and Electronice Engineering",
        "Electronics and Communication Engineering",
        "Engineering Design",
        "Mechanical Engineering",
        "Metallurgical and Materials Engineering",
        "Ocean Engineering",
        "Physics",
        "Chemistry",
        "Mathematics",
        "Biology",
        "Mining Engineering",
        "Others",
      ],
    };
  },
  methods: {
    /** After click, calls the parent method */
    submitForm(formData) {
      this.$emit("submit-form", formData);
    },
  },
};
</script>
