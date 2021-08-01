<template>
  <section>
    <div>
      <label>Enter your SRN / अपना SRN दर्ज करें</label>
      <div v-for="(input, index) in userIDList" :key="`IDInput-${index}`">
        <input
          v-model="input.userID"
          type="text"
          placeholder="Your SRN / आपका SRN"
          required
          @keypress="isValidSRNFormat($event)"
          :maxlength="10"
          class="inputStyleClass"
          @input="updateValue"
        />
        <span class="errorStyleClass" v-if="invalidMessage">{{ invalidMessage }}</span>
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
      <button @click="processForm" class="buttonStyleClass">SUBMIT / जमा करें</button>
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
    purposeParams: String,
  },
  data() {
    return {
      userIDList: [{ userID: "" }],
      invalidMessage: null,
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
    updateValue(event) {
      if (event.target.value.length < 10) {
        this.invalidMessage = "Please type 10 characters / कृपया १० अक्षर टाइप करें";
      } else {
        this.invalidMessage = "";
      }
    },
    processForm() {
      if (this.isSingleEntryOnly) {
        //this method constructs the URL based on the redirectTo param
        const redirectURL = process.env.VUE_APP_BASE_URL_PLIO;
        let url = new URL(redirectURL + this.redirectID); //adds plioID to the base plio link
        //adds params; api key and student SRN
        let queryparams = new URLSearchParams({
          api_key: process.env.VUE_APP_AF_API_KEY,
          unique_id: this.userIDList[0]["userID"],
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

.errorStyleClass {
  @apply mx-auto text-red-700 text-base mb-1;
}
</style>
