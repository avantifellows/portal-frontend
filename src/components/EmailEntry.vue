<template>
  <div v-if="show">
    <p class="text-base mb-[10px]">{{ label }}<span v-if="isRequired">*</span></p>

    <input
      type="email"
      v-model="email"
      @input="updateTextEntry($event)"
      class="border py-2 px-2 w-full rounded mx-auto border-grey"
    />
    <span class="mt-[10px] text-sm text-grey italic">{{ helpText }}</span>

    <span v-if="isInvalidTextEntryMessageShown" class="text-red text-sm mt-[10px]">{{
      invalidTextEntryMessage
    }}</span>
  </div>
</template>
<script>
export default {
  name: "EmailEntry",
  emits: ["update"],
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: "",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    helpText: {
      type: String,
      default: "",
    },
    dbKey: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      email: "",
      invalidTextEntryMessage: "",
    };
  },
  computed: {
    /**
     * Checks if the invalid text entry message is shown.
     * @returns {boolean} True if the invalid text entry message is not null, false otherwise.
     */
    isInvalidTextEntryMessageShown() {
      return this.invalidTextEntryMessage != null;
    },
  },
  methods: {
    /**
     * Updates the text value based on user entry
     * @param {Event} event - The input event.
     */
    updateTextEntry() {
      if (this.email.length == 0) {
        this.invalidTextEntryMessage = "";
      }
      this.$emit("update", this.email, this.dbKey);
    },
  },
};
</script>
