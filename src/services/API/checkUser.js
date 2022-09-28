import { client } from "@/services/API/rootClient.js";
import { checkUserEndpoint } from "@/services/API/endpoints.js";

export default {
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
};
