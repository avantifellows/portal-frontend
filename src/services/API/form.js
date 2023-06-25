import { dbClient } from "@/services/API/rootClient.js";

export default {
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
          throw new Error("Session API returned an error:", error);
        });
    });
  },
  getFormFields(studentId) {
    return new Promise((resolve) => {
      dbClient
        .get("/form-schema/student-form", {
          params: {
            number_of_fields: 5,
            form_name: "Haryana_Student_Details",
            student_id: studentId,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session API returned an error:", error);
        });
    });
  },
  studentData(data) {
    return new Promise((resolve) => {
      dbClient
        .post("/form-schema/student-form", {
          params: {
            number_of_fields: 5,
            form_name: "Haryana_Student_Details",
            student_id: studentId,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session API returned an error:", error);
        });
    });
  },
};
