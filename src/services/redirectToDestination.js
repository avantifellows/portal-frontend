import { sendSQSMessage } from "@/services/API/sqs";
import abTestService from "@/services/API/abTestData";

/** This function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built.
 * @param {String} purposeParams - extracted from auth layer URL
 * @param {Array} userIDList - list of userIDs wanting to go through the layer
 * @param {String} redirectId - extracted from auth layer URL
 * @param {String} redirectLink - from auth layer
 * @param {String} redirectTo - extracted from auth layer URL
 * @param {String} testType - test type from session meta_data
 * @param {String} urlTestType - test type from auth layer URL (optional, fallback to session meta_data)
 */

export async function redirectToDestination(
  purposeParams,
  userId,
  omrMode,
  abTestId,
  redirectId,
  redirectLink,
  redirectTo,
  group,
  testType,
  urlTestType
) {
  let redirectURL = "";
  let fullURL = "";
  let finalURLQueryParams = "";

  // Use URL testType if provided, otherwise fallback to session metadata testType
  const effectiveTestType = urlTestType || testType;

  // Handle special case: when redirectTo is "quiz" but testType is "form"
  let actualRedirectTo = redirectTo;
  if (redirectTo === "quiz" && effectiveTestType === "form") {
    actualRedirectTo = "form";
  }

  switch (actualRedirectTo) {
    case "AF-plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_AF_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_AF_API_KEY,
        unique_id: userId,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "SCERT-plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_SCERT_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_SCERT_API_KEY,
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
        omrMode: omrMode,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "form": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_FORM;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_APP_QUIZ_AF_API_KEY,
        userId: userId,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "report": {
      const abTestResult = await abTestService.getABTestData(
        1, // hardcoding abtestid for now
        redirectId,
        userId,
        redirectId
      );
      let redirectURL = null;
      if (abTestResult.inTest) {
        redirectURL = abTestResult.variantUrl;
      } else {
        if (effectiveTestType === "form") {
          redirectURL = import.meta.env.VITE_APP_FORM_REPORT_BASE_URL;
        } else {
          redirectURL = import.meta.env.VITE_APP_STUDENT_QUIZ_REPORT_BASE_URL;
        }
      }

      fullURL = redirectURL + "/" + redirectId + "/" + userId;
      break;
    }
    case "meet": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_MEET;
      fullURL = new URL(redirectURL + redirectId);
      break;
    }
    case "zoom": {
      fullURL = redirectLink;
      break;
    }
    case "teams": {
      fullURL = redirectLink;
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
    case "google-forms": {
      fullURL = redirectLink;
      break;
    }
    case "gurukul": {
      fullURL = import.meta.env.VITE_APP_GURUKUL_BASE_URL;
      break;
    }
    case "others": {
      fullURL = redirectLink;
      break;
    }
    default: {
      var purpose = "Error";
      sendSQSMessage(purpose, purposeParams, redirectTo, redirectId, userId);
      return false;
    }
  }

  window.open(fullURL, "_self");
  return true;
}
