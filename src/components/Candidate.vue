<template>
  <FormKit
    type="form"
    :config="{ validationVisibility: 'submit' }"
    :submit-attrs="{
      outerClass:
        'bg-blue-500 text-white py-2 px-4 rounded w-1/2 text-center mt-[20px] mx-auto',
    }"
    @submit="submitForm"
  >
    <FormKit
      type="text"
      label="*Name"
      validation="required|alpha_spaces|length:3,40"
      v-model="candidateName"
      validation-visibility="dirty"
      name="name"
      help="Enter your full name. Example: Karn Mathur"
      :outer-class="{
        'mb-[20px]': true,
      }"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
    />
    <FormKit
      type="select"
      label="*Gender"
      placeholder=" "
      :options="['Male', 'Female', 'Other']"
      validation="required"
      name="gender"
      help="Select your gender."
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="email"
      label="Email Address"
      validation="email"
      validation-visibility="dirty"
      name="email"
      help="Enter a valid email address if you have one. Example: karn.mathur@gmail.com"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="select"
      label="*Degree"
      :options="['B.Tech', 'BE', 'M.Tech', 'ME', 'B.Sc', 'M.Sc', 'Int. M.Sc']"
      validation="required"
      placeholder=" "
      name="degree"
      help="Select your degree"
      :label-class="{ 'text-base': true }"
      :input-class="{ 'w-full': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="select"
      label="*College/University"
      placeholder=" "
      :options="[
        'Central University of Kerala',
        'Delhi University',
        'NIT Delhi',
        'NIT Hamirpur',
        'NIT Jalandhar',
        'NIT Kurukshetra',
        'NIT Rourkela',
        'NIT Srinagar',
        'NITK Surathkal',
        'NIT Trichy',
        'NIT Uttarakhand',
        'NIT Warangal',
        'IIT Jammu',
        'Hindu College Delhi',
        'PEC Chandigarh',
        'Central University of Karnataka',
      ]"
      validation="required"
      name="college"
      help="Select your college/university"
      :input-class="{ 'w-full': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :label-class="{ 'text-base': true }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="select"
      label="*Branch/Department"
      placeholder=" "
      :options="branch"
      validation="required"
      name="branch"
      help="Select your branch/department"
      :input-class="{ 'w-full': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :label-class="{ 'text-base': true }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="tel"
      label="*Phone Number"
      validation="required|matches:/^[0-9]{10}$/"
      validation-visibility="dirty"
      v-model="phoneNumber"
      name="number"
      help="Please enter a valid mobile number. Example: 9848022335"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="number"
      label="*Latest CGPA"
      validation="required|min:0|max:10.0"
      validation-visibility="dirty"
      v-model="cgpa"
      name="cgpa"
      step="0.1"
      help="Please enter a valid CGPA. Example: 7.5"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="select"
      label="*Home State"
      placeholder=" "
      :options="states"
      validation="required"
      name="state"
      help="Select your home state"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
      :outer-class="{
        'mb-[20px]': true,
      }"
    />
    <FormKit
      type="select"
      label="*Preferred Teaching Subject"
      placeholder=" "
      v-model="subject"
      :options="['Physics', 'Chemistry', 'Biology', 'Mathematics']"
      validation="required"
      name="subject"
      help="Select your preferred teaching
    subject"
      :input-class="{ 'w-full': true }"
      :label-class="{ 'text-base': true }"
      :inner-class="{
        'border py-2 px-2 rounded border-grey overflow-hidden': true,
      }"
      :help-class="{
        'mt-[5px] text-sm text-grey italic': true,
      }"
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
