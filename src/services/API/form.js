import { dbClient } from "@/services/API/rootClient.js";

export default {
  /** Gets data about a form schema
   * @param {String} name - name of the form schema
   */
  getFormSchema(name) {
    return new Promise((resolve) => {
      dbClient
        .get("/form-schema/", {
          params: {
            form_name: name,
          },
        })
        .then((response) => {
          resolve(response.data[0]);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Form API returned an error:", error);
        });
    });
  },

  /** Returns fields that are to be completed by the student
   * @param {Number} numberOfFields - number of fields to show the user
   * @param {String} formName - name of the form
   * @param {String} studentId - student ID
   */
  getFormFields(numberOfFields, group, studentId) {
    return new Promise((resolve) => {
      dbClient
        .get("/student-form", {
          params: {
            number_of_fields: numberOfFields,
            group: group,
            student_id: studentId,
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
