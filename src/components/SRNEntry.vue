<template>
  <section>
    <div v-if="plioUse" class="flex flex-col mt-8">
      <label :class="labelStyleClass">Enter Student SRN</label>
      <input
        v-model="singleUserID"
        type="text"
        placeholder="Student SRN"
        required
        @keypress="isValidSRNFormat($event)"
        :class="inputStyleClass"
      />
      <button @click="this.processForm" :class="buttonStyleClass">SUBMIT</button>
    </div>

    <div v-else class="flex flex-col mt-8">
      <label :class="labelStyleClass">Enter Student SRN</label>
      <div
        v-for="(input, index) in userIDList"
        :key="`IDInput-${index}`"
        :class="inputStyleClass"
      >
        <input
          v-model="input.userID"
          type="text"
          placeholder="Student SRN"
          required
          @keypress="isValidSRNFormat($event)"
        />
        <inline-svg
          @click="addField(index, userIDList)"
          :src="require('@/assets/images/add-button.svg')"
        ></inline-svg>
        <inline-svg
          v-show="isAnyUserIDPresent"
          @click="removeField(index, userIDList)"
          class="ml-2 cursor-pointer"
          :src="require('@/assets/images/delete-button.svg')"
        ></inline-svg>
      </div>
      <button :class="buttonStyleClass">SUBMIT</button>
    </div>
  </section>
</template>

<script>
export default {
  name: "SRNEntry",
  props: {
    redirectTo: String,
    redirectID: String,
    purpose: String,
    subPurpose: String,
    plioUse: Boolean,
  },
  data() {
    return {
      userIDList: [{ userID: "" }],
      singleUserID: "", //is a temp hack
    };
  },
  computed: {
    buttonStyleClass() {
      return "block bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 rounded";
    },
    labelStyleClass() {
      return "mb-2 mx-auto uppercase font-bold text-lg text-grey-darkest";
    },
    inputStyleClass() {
      return "flex border py-2 mx-auto px-3 text-grey-darkest";
    },
    isAnyUserIDPresent() {
      return this.userIDList.length > 1;
    },
  },
  methods: {
    //checking to see if each char typed by user is only a letter or number
    isValidSRNFormat(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[a-z0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },
    addField(value, list) {
      list.push({ value: "" });
    },
    removeField(index, list) {
      list.splice(index, 1);
    },
    //this method constructs the URL based on the redirectTo param
    processForm() {
      if (this.redirectTo == "plio") {
        const redirectURL = process.env.VUE_APP_STAGING_PLIO_LINK;
        let url = new URL(redirectURL + this.redirectID); //adds plioID to the base plio link
        //adds params; api key and student SRN
        let queryparams = new URLSearchParams({
          api_key: process.env.VUE_APP_HARYANA_STAGING_API_KEY,
          unique_id: this.singleUserID,
        });
        let fullurl = url + "?" + queryparams;
        window.location.href = fullurl;
      }
    },
  },
};
</script>
