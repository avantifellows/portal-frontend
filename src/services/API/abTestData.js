// src/services/API/abTestData.js
import { dbClient } from "@/services/API/rootClient.js";
import { getAbTestDataEndpoint } from "./endpoints";

export default {
  /**
   * Fetches A/B test data by ID and processes it
   *
   * @param {string} abtestId - The ID of the A/B test
   * @param {string} sessionId - The session ID to check against the test
   * @param {string} userId - The user ID to determine variant
   * @returns {Promise<Object>} - Object containing test status and variant info
   */
  getABTestData(abtestId, sessionId, userId, redirectId) {
    return new Promise((resolve) => {
      if (!abtestId || abtestId === "") {
        resolve({ inTest: false, reason: "invalid_test_id" });
        return;
      }

      dbClient
        .get(getAbTestDataEndpoint, { params: { id: abtestId } })
        .then((response) => {
          const testData = response.data;

          // Check if test exists and is active
          if (!testData || testData.status !== "active") {
            resolve({ inTest: false, reason: "test_not_active" });
            return;
          }

          // Check if session is part of this test
          if (!testData.session_ids.includes(sessionId)) {
            resolve({ inTest: false, reason: "session_not_in_test" });
            return;
          }

          // Check which variant this user belongs to
          let userVariant = null;
          for (const [variant, users] of Object.entries(testData.variants)) {
            if (users.includes(userId)) {
              userVariant = variant;
              break;
            }
          }

          if (redirectId.includes("EnableStudents")) {
            userVariant = "treatment";
          }

          if (!userVariant) {
            resolve({ inTest: false, reason: "user_not_in_test" });
            return;
          }

          // User is in test, return relevant data
          resolve({
            inTest: true,
            variant: userVariant,
            variantUrl: testData.metadata.variant_urls[userVariant],
          });
        })
        .catch((error) => {
          resolve({ inTest: false, reason: "error", error: error });
          console.error("Error fetching A/B test data:", error);
        });
    });
  },
};
