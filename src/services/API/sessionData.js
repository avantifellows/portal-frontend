
import { dbClient } from "@/services/API/rootClient.js";
import {
  getSessionDataEndpoint,
  sessionGroupEndpoint,
} from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular session
   * @param {String} sessionId - the ID of the session whose data needs to be retrieved
   */
  getSessionData(sessionId) {
    return new Promise((resolve) => {
      dbClient
        .get(getSessionDataEndpoint + "/" + sessionId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Session API returned an error:", error);
        });
    });
  },
  getGroupId(sessionId) {
    return new Promise((resolve) => {
      dbClient
        .post(sessionGroupEndpoint, JSON.stringify(sessionId))
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
