import { client, dbClient } from "@/services/API/rootClient.js";
import { getGroupDataEndpoint } from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular group
   * @param {String} groupName - the name of the group whose data needs to be retrieved
   */
  getGroupData(groupName) {
    const params = {
      group: groupName,
    };
    return new Promise((resolve) => {
      client
        .post(getGroupDataEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Group API returned an error:", error);
        });
    });
  },
  getGroupName(sessionId) {
    return new Promise((resolve) => {
      dbClient
        .get("/session-group/" + sessionId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Group API returned an error:", error);
        });
    });
  },
};
