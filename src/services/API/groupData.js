import { client } from "@/services/API/rootClient.js";
import { getGroupEndpoint } from "@/services/API/endpoints.js";

export default {
  /**
   * Retrieves details about a particular group
   * @param {String} groupId - the ID of the group whose data needs to be retrieved
   */
  getGroupData(groupId) {
    const params = {
      id: groupId,
    };
    return new Promise((resolve) => {
      client
        .get(getGroupEndpoint, { params })
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
