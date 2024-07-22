import TextEntry from "@/components/TextEntry.vue";
import CodeEntry from "@/components/CodeEntry.vue";
import EmailEntry from "@/components/EmailEntry.vue";
import Datepicker from "@/components/Datepicker.vue";
import Dropdown from "@/components/Dropdown.vue";
import NumberEntry from "@/components/NumberEntry.vue";
import NewPhoneNumberEntry from "@/components/NewPhoneNumberEntry.vue";
import Upload from "@/components/Upload.vue";
import Checkbox from "@/components/Checkbox.vue";
import { shallowRef } from "vue";

export const authToInputParameters = {
  number: ["ID"],
  phoneNumber: ["PH"],
  date: ["DOB"],
  code: ["CODE"],
};

export const typeToInputParameters = {
  text: shallowRef(TextEntry),
  email: shallowRef(EmailEntry),
  number: shallowRef(NumberEntry),
  dropdown: shallowRef(Dropdown),
  date: shallowRef(Datepicker),
  phone: shallowRef(NewPhoneNumberEntry),
  upload: shallowRef(Upload),
  checkbox: shallowRef(Checkbox),
  code: shallowRef(CodeEntry),
};
