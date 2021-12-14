<template>
  <div>
    <IdEntry
      :redirectTo="redirectTo"
      :redirectID="redirectID"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :textObject="textObject"
      :inputObject="inputObject"
      :maxNumberOfInput="maxNumberOfInput"
      :dataSourceObject="dataSourceObject"
      :program="program"
      :authType="authType"
    />
  </div>
</template>

<script>
import IdEntry from "@/components/IdEntry.vue";
import firebaseAPI from "@/services/API/getProgramData.js";

export default {
  name: "Home",
  components: {
    IdEntry,
  },
  props: {
    redirectTo: {
      /** The resource we are redirecting to. Eg. redirectTo = plio tells us that we are redirecting to a plio. */
      default: "",
      type: String,
    },
    redirectID: {
      /** ID of the resource. Eg. the plioID */
      default: "",
      type: String,
    },
    purpose: {
      /** General category of why the data is being captured. Eg: attendance */
      default: "",
      type: String,
    },
    purposeParams: {
      /** Subcategory of the purpose. Eg: plio -> means the attendance is for a plio link */
      default: "",
      type: String,
    },
    program: {
      /** The program the user falls under. Eg: HaryanaStudents, DelhiStudents */
      default: "",
      type: String,
    },
    authType: {
      /** The authentication method used by the user */
      default: "",
      type: String,
    },
  },
  data() {
    return {
      textObject: {
        placeholderText: "",
        displayText: "",
        addButtonText: "",
        invalidInputMessage: "",
        invalidLoginMessage: "",
        submitButtonText: "",
      },
      maxNumberOfInput: 0,
      inputObject: {
        basicInputValidationType: "",
        maxLengthOfId: 0,
        mode: null,
        type: null,
      },
      dataSourceObject: {
        name: "",
        column: "",
      },
    };
  },
  computed: {
    isMultipleIDEntryAllowed() {
      return this.redirectTo == "plio";
    },
  },
  async created() {
    var programData = await firebaseAPI.getProgramData(this.program);

    let textObject = programData["text"];
    this.textObject["placeholderText"] = textObject["placeholder"];
    this.textObject["displayText"] = textObject["display"];
    this.textObject["addButtonText"] = textObject["addButton"];
    this.textObject["invalidInputMessage"] = textObject["invalid"]["input"];
    this.textObject["invalidLoginMessage"] = textObject["invalid"]["login"];
    this.textObject["submitButtonText"] = textObject["submitButton"];

    this.maxNumberOfInput = programData["maxNumberOfIds"];

    let inputObject = programData["input"];
    this.inputObject["basicInputValidationType"] = inputObject["basicValidationType"];
    this.inputObject["maxLengthOfId"] = inputObject["maxLengthOfId"];
    this.inputObject["mode"] = inputObject["mode"];
    this.inputObject["type"] = inputObject["type"];

    let dataSourceObject = programData["dataSource"];
    this.dataSourceObject["name"] = dataSourceObject["name"];
    this.dataSourceObject["column"] = dataSourceObject["column"];
  },
};
</script>
