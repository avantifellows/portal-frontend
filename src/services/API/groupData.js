import { fastAPIClient } from "@/services/API/rootClient.js";

export default {
  /**
   * Returns name of a group associated with a session
   * @param {String} sessionId - ID of the session whose group name needs to be returned
   */
  getAuthGroupName(sessionId) {
    return new Promise((resolve) => {
      fastAPIClient
        .get("/session-group/" + sessionId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session Group API returned an error:", error);
        });
    });
  },
  /**
   * Returns name of a group associated with a session
   * @param {String} sessionId - ID of the session whose group name needs to be returned
   */
  getAuthGroupData(authGroup) {
    const params = {
      name: authGroup,
    };
    return new Promise((resolve) => {
      fastAPIClient
        .get("/auth-group/", { params })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Auth Group API returned an error:", error);
        });
    });
  },
};
