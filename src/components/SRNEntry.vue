<template>
  <section>
    <div>
      <label>Enter your SRN / अपना SRN दर्ज करें</label>
      <div
        class="multipleStudentStyle"
        v-for="(input, index) in userIDList"
        :key="`IDInput-${index}`"
      >
        <input
          v-model="input.userID"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Your SRN / आपका SRN"
          required
          @keypress="isValidSRNFormat($event)"
          class="inputStyleClass"
          @input="updateValue"
        />

        <div class="flex flex-row my-auto" v-if="isUserValidated">
          <div class="plus-sign mr-3" @click="addField(index, userIDList)"></div>
          <div
            class="minus-sign"
            v-show="ifUserEnteredMoreThanOne"
            @click="removeField(index, userIDList)"
          ></div>
        </div>
      </div>
      <span class="errorStyleClass" v-if="invalidInputMessage">{{
        invalidInputMessage
      }}</span>
      <button
        @click="processForm"
        class="buttonStyleClass"
        :disabled="isSubmitButtonDisabled"
      >
        SUBMIT / जमा करें
      </button>
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
      invalidInputMessage: null,
      maxLength: 10,
    };
  },
  computed: {
    isAnyUserIDPresent() {
      return (
        this.userIDList != null &&
        this.userIDList != undefined &&
        this.userIDList.length > 0 &&
        this.userIDList[0]["userID"] != ""
      );
    },
    ifUserEnteredMoreThanOne() {
      return !this.isSingleEntryOnly && this.userIDList.length > 1;
    },
    isSingleEntryOnly() {
      return this.redirectTo == "plio";
    },
    isSubmitButtonDisabled() {
      return !this.isAnyUserIDPresent || this.invalidInputMessage != "";
    },
    isUserValidated() {
      return (
        !this.isSingleEntryOnly &&
        this.userIDList[0]["userID"].length > this.maxLength - 1
      );
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
      if (event.target.value.length < this.maxLength) {
        this.invalidInputMessage = "Please type 10 characters / कृपया १० अक्षर टाइप करें";
      } else {
        this.invalidInputMessage = "";
      }
      if (event.target.value.length > this.maxLength) {
        event.target.value = event.target.value.slice(0, this.maxLength);
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
  @apply flex border py-2 mx-auto px-3 h-12;
}
.buttonStyleClass {
  @apply bg-primary hover:bg-primary-hover text-white uppercase text-lg mx-auto p-4 mt-4 rounded disabled:opacity-50;
}

.errorStyleClass {
  @apply mx-auto text-red-700 text-base mb-1;
}

.plus-sign {
  border: 1px solid;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  color: green;
  transition: color 0.25s;
  position: relative;
}
.plus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  margin-left: -10px;
  margin-top: -3px;
  border-top: 7px solid;
}
.plus-sign::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  height: 20px;
  margin-left: -3px;
  margin-top: -10px;
  border-left: 7px solid;
}
.minus-sign {
  border: 1px solid;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  color: red;
  transition: color 0.25s;
  position: relative;
}
.minus-sign::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  margin-left: -10px;
  margin-top: -3px;
  border-top: 7px solid;
}

.multipleStudentStyle {
  @apply relative flex flex-row;
}
</style>
