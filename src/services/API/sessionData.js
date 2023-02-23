import { client } from "@/services/API/rootClient.js";

export default {
  /**
   * Retrieves details about a particular session
   * @param {String} sessionId - the ID of the session whose data needs to be retrieved
   */
  getSessionData(sessionId) {
    const params = {
      session_id: sessionId,
    };
    return new Promise((resolve) => {
      client
        .get("/session", { params })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session API returned an error:", error);
        });
    });
  },

  /**
   * Retrieves group ID associated with a session
   * @param {String} sessionId - the ID of the session whose group ID needs to be returned
   */

  getGroupId(sessionId) {
    return new Promise((resolve) => {
      client
        .get(`/session-group/${sessionId}`)
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
