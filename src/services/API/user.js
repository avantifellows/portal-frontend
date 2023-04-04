import { client } from "@/services/API/rootClient.js";
import {
  verifyStudentEndpoint,
  postUserActivityEndpoint,
} from "@/services/API/endpoints.js";

export default {
  /**
   * Validates that the ID exists
   * @param {String} userID - the id that needs to be validated
   */
  verifyStudent(studentData) {
    return new Promise((resolve) => {
      client
        .get(verifyStudentEndpoint, { params: studentData })
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
  /**
   * Posts data about activity of the user with Portal
   * @param {Array} userIDList - the IDs of the users
   * @param {String} sessionId - ID of the session being interacted with
   */
  postUserActivity(userIDList, sessionId) {
    userIDList.forEach((user) => {
      const params = {
        user_id: user.userID,
        session_occurrence_id: sessionId,
        is_user_valid: user.valid,
      };
      return new Promise((resolve) => {
        client
          .post(postUserActivityEndpoint, params)
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
};
