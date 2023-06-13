import { sendSQSMessage } from "@/services/API/sqs";

/** This function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built.
 * @param {String} purposeParams - extracted from auth layer URL
 * @param {Array} userIDList - list of userIDs wanting to go through the layer
 * @param {String} redirectId - extracted from auth layer URL
 * @param {String} redirectTo - extracted from auth layer URL
 * @param {String} authType - extracted from auth layer URL
 */

export function redirectToDestination(
  purposeParams,
  userId,
  redirectId,
  redirectTo,
  group
) {
  let redirectURL = "";
  let fullURL = "";
  let finalURLQueryParams = "";

  switch (redirectTo) {
    case "plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_AF_API_KEY,
        unique_id: userId,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "quiz": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_QUIZ;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_APP_QUIZ_AF_API_KEY,
        userId: userId,
      });
      fullURL = url + "?" + finalURLQueryParams;
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
        teacherID: userId,
        groupName: group,
      });
      fullURL = redirectId + "?" + finalURLQueryParams;
      break;
    }
    default: {
      var purpose = "Error";
      sendSQSMessage(purpose, purposeParams, redirectTo, redirectId, userId);
      return false;
    }
  }

  window.open(fullURL);
  return true;
}
