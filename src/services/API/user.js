import { client } from "@/services/API/rootClient.js";
import {
  checkUserEndpoint,
  checkBirthdateEndpoint,
  studentSignupEndpoint,
} from "@/services/API/endpoints.js";

/**
 * Creates a new student
 * @param {Object} formData - contains data filled in the form by user
 */
export default {
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
  checkUserExists(userID, collectionName, columnName) {
    const params = {
      userID: userID,
      collectionName: collectionName,
      columnName: columnName,
    };
    return new Promise((resolve) => {
      client
        .post(checkUserEndpoint, JSON.stringify(params))
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
      birthdate: birthdate,
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
