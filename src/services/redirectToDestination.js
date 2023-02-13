import { sendSQSMessage } from "@/services/API/sqs";
import { createAccessTokenEndpoint } from "./API/endpoints";

/** This function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built.
 * @param {String} purposeParams - extracted from auth layer URL
 * @param {Array} userIDList - list of userIDs wanting to go through the layer
 * @param {String} redirectId - extracted from auth layer URL
 * @param {String} redirectTo - extracted from auth layer URL
 * @param {String} authType - extracted from auth layer URL
 */

export async function redirectToDestination(
  purposeParams,
  userIDList,
  redirectId,
  redirectTo,
  authType,
  group
) {
  let redirectURL = "";
  let fullURL = "";
  let finalURLQueryParams = "";
  let userID =
    typeof userIDList == "string" ? userIDList : userIDList[0]["userID"];

  switch (redirectTo) {
    case "plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_AF_API_KEY,
        unique_id: userID,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "quiz": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_QUIZ;
      const apiKey = import.meta.env.VITE_APP_QUIZ_AF_API_KEY;
      const unique_id = userID;
      let url = new URL(redirectURL + redirectId);
      const response = await fetch(createAccessTokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_user_valid: true,
          id: unique_id,
          data: {
            apiKey: apiKey
          }
        }),
      });

      if (response.ok) {
        fullURL = url;
      } else {
        var purpose = "Error";
        sendSQSMessage(
          purpose,
          purposeParams,
          redirectTo,
          redirectId,
          userIDList,
          authType
        );
        return false;
      }
      break;
    }
    case "meet": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_MEET;
      fullURL = new URL(redirectURL + redirectId);
      break;
    }
    case "zoom": {
      fullURL = redirectId;
      break;
    }
    case "youtube": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_YOUTUBE;
      fullURL = new URL(redirectURL + redirectId);
      break;
    }
    case "teacher-web-app": {
      finalURLQueryParams = new URLSearchParams({
        teacherID: userID,
        groupName: group,
      });
      fullURL = redirectId + "?" + finalURLQueryParams;
      break;
    }
    default: {
      var purpose = "Error";
      sendSQSMessage(
        purpose,
        purposeParams,
        redirectTo,
        redirectId,
        userIDList,
        authType
      );
      return false;
    }
  }

  window.open(fullURL, "_self");
  return true;
}
