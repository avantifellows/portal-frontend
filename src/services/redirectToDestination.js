import { sendSQSMessage } from "@/services/API/sqs";

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

  const response = await fetch(
    `${import.meta.env.VITE_APP_AUTH_API_URL}/create-access-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          id: userID,
          data: {
            purposeParams,
            redirectId,
            redirectTo,
            authType,
            group,
          },
        },
      }),
    }
  );
  const json = await response.json();

  if (!json.message) {
    var purpose = "Error";
    sendSQSMessage(
      purpose,
      purposeParams,
      redirectTo,
      redirected,
      userIDList,
      authType
    ); return false;
  }

  switch (redirectTo) {
    case "plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_PLIO;
      let url = new URL(redirectURL + redirectId);
      fullURL = url + "?token=" + json.access_token;
      break;
    }
    case "quiz": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_QUIZ;
      let url = new URL(redirectURL + redirectId);
      fullURL = url + "?token=" + json.access_token;
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
      fullURL = redirectId + "?token=" + json.access_token;
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
