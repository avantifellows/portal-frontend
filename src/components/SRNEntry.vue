<template>
  <section>
    <div v-if="isSingleEntryOnly">
      <label>Enter your SRN / अपना SRN दर्ज करें</label>
      <input
        v-model="singleUserID"
        type="text"
        placeholder="Student SRN"
        required
        @keypress="isValidSRNFormat($event)"
        :maxlength="10"
        class="inputStyleClass"
      />
      <button @click="this.processForm" class="buttonStyleClass">SUBMIT</button>
    </div>

    <div v-else>
      <label :class="labelStyleClass">Enter your SRN</label>
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
          v-if="!isSingleEntryOnly"
          @click="addField(index, userIDList)"
          :src="require('@/assets/images/add-button.svg')"
        ></inline-svg>
        <inline-svg
          v-show="isAnyUserIDPresent && !isSingleEntryOnly"
          @click="removeField(index, userIDList)"
          class="ml-2 cursor-pointer"
          :src="require('@/assets/images/delete-button.svg')"
        ></inline-svg>
      </div>
      <button @click="this.processForm" :class="buttonStyleClass">SUBMIT</button>
    </div>
  </section>
</template>

<script>
export default {
  name: "SRNEntry",
  props: {
    redirectTo: String,
    redirectID: String,
    purposeParams: String,
    subPurposeParams: String,
  },
  data() {
    return {
      userIDList: [{ userID: "" }],
      singleUserID: "", //is a temp hack
    };
  },
  computed: {
    isAnyUserIDPresent() {
      return this.userIDList != null;
    },
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
  },
  methods: {
    isValidSRNFormat(e) {
      //checking to see if each char typed by user is only a number
      let char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },
    addField(value, list) {
      list.push({ value: "" });
    },
    removeField(index, list) {
      list.splice(index, 1);
    },
    processForm() {
      if (this.isSingleEntryOnly) {
        //this method constructs the URL based on the redirectTo param
        const redirectURL = process.env.VUE_APP_BASE_URL_PLIO_STAGING;
        let url = new URL(redirectURL + this.redirectID); //adds plioID to the base plio link
        //adds params; api key and student SRN
        let queryparams = new URLSearchParams({
          api_key: process.env.VUE_APP_AF_STAGING_API_KEY,
          unique_id: this.singleUserID,
        });
        let fullurl = url + "?" + queryparams;
        window.open(fullurl);
      }
    },
  },
};
</script>

<style lang="postcss">
div {
  @apply flex flex-col mt-8;
}
label {
  @apply mb-2 mx-auto uppercase font-bold text-lg;
}
.inputStyleClass {
  @apply flex border py-2 mx-auto px-3;
}
.buttonStyleClass {
  @apply bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 rounded;
}
</style>
