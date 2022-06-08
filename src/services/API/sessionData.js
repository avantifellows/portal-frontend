import { client } from "@/services/API/rootClient.js";
import { getSessionDataEndpoint } from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular session
   * @param {String} sessionId - the ID of the session whose data needs to be retrieved
   */
  getSessionData(sessionId) {
    const params = {
      sessionId: sessionId,
    };
    return new Promise((resolve) => {
      client
        .post(getSessionDataEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        });
    });
  },
};
