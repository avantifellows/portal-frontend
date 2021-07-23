<template>
  <section class="w-full flex justify-center items-center my-10">
    <form class="">
      <div class="form-group">
        <label class="text-gray-600 font-semibold text-lg">Enter Student ID</label>
        <div
          v-for="(input, index) in studentIDs"
          :key="`IDInput-${index}`"
          class="input wrapper flex items-center"
        >
          <input
            v-model="input.studentID"
            type="number"
            class="h-10 rounded-lg outline-none p-2"
            placeholder="Student ID"
            required
            v-on:keypress="isLetter($event)"
          />

          <svg
            @click="addField(input, studentIDs)"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            class="ml-2 cursor-pointer"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              fill="green"
              d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4zm1 11C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
            />
          </svg>

          <svg
            v-show="studentIDs.length > 1"
            @click="removeField(index, studentIDs)"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            class="ml-2 cursor-pointer"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              fill="#EC4899"
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z"
            />
          </svg>
        </div>
      </div>
    </form>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @submit.prevent="processForm"
    >
      SUBMIT
    </button>
  </section>
</template>

<script>
export default {
  name: "SRNEntry",
  data() {
    return {
      studentIDs: [{ studentID: "" }],
    };
  },
  methods: {
    isLetter(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },
    addField(value, fieldType) {
      fieldType.push({ value: "" });
    },
    removeField(index, fieldType) {
      fieldType.splice(index, 1);
    },
    processForm() {
      // console.log(this.$route.query.redirecturl);
      this.$router.push(this.$route.query.redirecturl);
    },
  },
};
</script>
