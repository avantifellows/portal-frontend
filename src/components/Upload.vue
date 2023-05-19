<template>
  <div class="flex flex-col justify-center">
    <p
      class="w-1/2 text-xl lg:text-2xl xl:text-3xl mx-auto font-bold md:w-3/4 text-center"
    >
      {{ label }}
    </p>
    <div class="flex flex-row justify-center">
      <FormKit
        type="file"
        label="Documents"
        accept=".pdf,.doc,.docx,.xml,.md,.csv"
        help="Select as many documents as you would like."
        multiple="true"
      />
    </div>
    <span
      v-if="isInvalidEntryMessageShown"
      class="mx-auto text-red-700 text-base mb-1"
      >{{ invalidEntryMessage }}</span
    >
  </div>
</template>
<script>
import { validationTypeToFunctionMap } from "@/services/basicValidationMapping.js";

export default {
  name: "Dropdown",
  props: {
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      defult: "",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: [],
    },
    helpText: {
      type: String,
      default: "",
    },
    key: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      key: "",
      invalidEntryMessage: "",
    };
  },
  computed: {
    /** Returns if message for an invalid text entry needs to be shown */
    isInvalidEntryMessageShown() {
      return this.invalidEntryMessage != null;
    },
  },
};
</script>
