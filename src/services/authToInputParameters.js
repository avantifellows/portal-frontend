import TextEntry from "../components/TextEntry.vue";
import Datepicker from "../components/Datepicker.vue";
import Dropdown from "../components/Dropdown.vue";
import NumberEntry from "../components/NumberEntry.vue";
import PhoneNumberEntry from "../components/PhoneNumberEntry.vue";
import Upload from "../components/Upload.vue";

export const authToInputParameters = {
  number: ["ID"],
  phoneNumber: ["PH"],
  date: ["DOB"],
};

export const typeToInputParameters = {
  text: TextEntry,
  number: NumberEntry,
  dropdown: Dropdown,
  date: Datepicker,
  phone: PhoneNumberEntry,
  uplaod: Upload,
};
