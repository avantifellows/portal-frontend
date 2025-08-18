import { fastAPIClient } from "@/services/API/rootClient.js";

/**
 * Function to send SQS message via backend API
 * @param {String} type
 * @param {String} sub_type # deprecated
 * @param {String} platform
 * @param {String} platformId
 * @param {String} userId
 * @param {String} authType
 * @param {String} authGroup
 * @param {String} userType
 * @param {String} sessionId
 * @param {String} userIpAddress
 * @param {String} phoneNumber
 * @param {String} batch
 * @param {String} dateOfBirth
 */
export function sendSQSMessage(
  type,
  sub_type,
  platform,
  platformId,
  userId,
  authType,
  authGroup,
  userType,
  sessionId,
  phoneNumber,
  batch,
  dateOfBirth,
  userIpAddress
) {
  return new Promise((resolve) => {
    fastAPIClient
      .post("/user-session/send-message", {
        type,
        sub_type: sub_type || "",
        platform,
        platform_id: platformId,
        user_id: userId,
        auth_type: authType,
        auth_group: authGroup,
        user_type: userType,
        session_id: sessionId,
        user_ip_address: userIpAddress || "",
        phone_number: phoneNumber || "",
        batch: batch || "",
        date_of_birth: dateOfBirth || "",
        user_validated: true,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve({ error: error });
        throw new Error("SQS API returned an error:", error);
      });
  });
}
