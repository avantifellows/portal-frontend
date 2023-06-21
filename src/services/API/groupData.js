import { dbClient } from "@/services/API/rootClient.js";
import { getGroupDataEndpoint } from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular group
   * @param {String} groupName - the name of the group whose data needs to be retrieved
   */
  getGroupData(group) {
    return new Promise((resolve) => {
      dbClient
        .post(getGroupDataEndpoint, JSON.stringify(group))
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
