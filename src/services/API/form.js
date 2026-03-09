import { fastAPIClient } from "@/services/API/rootClient.js";

export default {
  /** Gets data about a form schema
   * @param {String} id - ID of the form schema
   * @param {String} authGroup - Auth group for form enhancement (optional)
   */
  getFormSchema(id, authGroup = null) {
    return new Promise((resolve) => {
      const params = { id: id };
      if (authGroup) {
        params.auth_group = authGroup;
      }

      fastAPIClient
        .get("/form-schema/", {
          params: params,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Form API returned an error:", error);
        });
    });
  },

  /** Returns fields that are to be completed by the student
   * @param {Number} numberOfFields - number of fields to show the user
   * @param {String} formId - ID of the form
   * @param {String} userId - canonical user ID
   */
  getFormFields(numberOfFields, formId, userId) {
    return new Promise((resolve) => {
      fastAPIClient
        .get("/form-schema/student", {
          params: {
            number_of_fields_in_popup_form: numberOfFields,
            form_id: formId,
            user_id: userId,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Form API returned an error:", error);
        });
    });
  },
};
