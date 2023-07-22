import { client, dbClient } from "@/services/API/rootClient.js";
import {
  studentSignupEndpoint,
  userSignupEndpoint,
  verifyStudentEndpoint
} from "@/services/API/endpoints.js";
import { checkForUserEndpoint } from "./endpoints";

export default {
  /**
   * Validates that the ID exists
   * @param {String} userID - the id that needs to be validated
   */
  verifyStudent(studentData) {
    return new Promise((resolve) => {
      dbClient
        .get(verifyStudentEndpoint, { params: studentData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },

  /**
   * Creates a new user
   * @param {Object} formData - contains data filled in the form by user
   */
  userSignup(formData, idGeneration, userType) {
    return new Promise((resolve) => {
      dbClient
        .post(
          userSignupEndpoint,
          JSON.stringify({
            form_data: formData,
            id_generation: idGeneration,
            user_type: userType,
          })
        )
        .then((response) => {
          resolve(response.data.toString());
        })
        .catch((error) => {
          console.log(error);
          resolve({ error: error });
          throw new Error(error);
        });
    });
  },

  /** Posts profile data that a student has entered
   * @param {Object} data - student data
   */
  studentData(data) {
    return new Promise((resolve) => {
      dbClient
        .post("/student/complete-profile-details", data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Form API returned an error:", error);
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
  verifyUser(userId, collectionName) {
    const params = {
      userID: userId,
      collectionName: collectionName,
    };
    return new Promise((resolve) => {
      client
        .post(checkForUserEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },
  doesBirthdateMatch(birthdate, userID, collectionName) {
    const params = {
      userID: userID,
      collectionName: collectionName,
      dob: birthdate,
    };

    return new Promise((resolve) => {
      client
        .post(checkBirthdateEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

};
