import { client } from "@/services/API/rootClient.js";
import {
  checkBirthdateEndpoint,
  studentSignupEndpoint,
  userSignupEndpoint,
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
   * @param {String} collectionName - firestore collection against which the ID needs to be validated
   * @param {String} columnName - name of the column which contains the ID
   */
  checkStudentExists(userID) {
    const params = {
      student_id: userID,
    };

    return new Promise((resolve) => {
      client
        .get("/student/verify", { params: params })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            resolve({ error: error });
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },
  userActivity(userIDList, sessionId) {
    userIDList.forEach((user) => {
      const params = {
        user_id: user.userID,
        session_occurrence_id: sessionId,
        is_user_valid: user.valid,
      };
      return new Promise((resolve) => {
        client
          .post("/user-session", params)
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            console.log(error);
            resolve({ error: error });
            throw new Error("User API returned an error:", error);
          });
      });
    });
  },
  /**
   * Validates that the birthdate matches the userID
   * @param {Object} birthdate - the birthdate that is being matched
   * @param {String} userID - the id against which matching is done
   * @param {String} collectionName - firestore collection against which the ID needs to be validated
   * @param {String} columnName - name of the column which contains the ID
   */
  doesBirthdateMatch(birthdate, userID, collectionName, columnName) {
    const params = {
      userID: userID,
      collectionName: collectionName,
      columnName: columnName,
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
