import { client, newClient } from "@/services/API/rootClient.js";
import {
  studentSignupEndpoint,
  userSignupEndpoint,
  verifyStudentEndpoint,
} from "@/services/API/endpoints.js";

/**
 * Creates a new user
 * @param {Object} formData - contains data filled in the form by user
 */
export default {
  userSignup(formData) {
    return new Promise((resolve) => {
      client
        .post(userSignupEndpoint, JSON.stringify(formData))
        .then((response) => {
          resolve(response.data.toString());
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

  /**
   * Creates a new student
   * @param {Object} formData - contains data filled in the form by user
   */
  studentSignup(formData) {
    return new Promise((resolve) => {
      client
        .post(studentSignupEndpoint, JSON.stringify(formData))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },
  /**
   * Validates that the ID exists
   * @param {String} userID - the id that needs to be validated
   */
  verifyStudent(studentData) {
    console.log(newClient);
    return new Promise((resolve) => {
      newClient
        .get(verifyStudentEndpoint, { params: studentData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.status == 404) resolve(false);
          else {
            resolve({ error: error });
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },
};
