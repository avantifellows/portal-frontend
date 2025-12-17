import { sendSQSMessage } from "@/services/API/sqs";
import abTestService from "@/services/API/abTestData";

/** Redirects user to the appropriate destination platform
 * @param {String} userId - user ID for authentication
 * @param {Boolean} omrMode - whether OMR mode is enabled
 * @param {String} abTestId - A/B test identifier
 * @param {String} redirectId - platform-specific ID
 * @param {String} redirectLink - direct link for some platforms
 * @param {String} redirectTo - destination platform name
 * @param {String} group - user group for context
 * @param {String} testType - test type from session meta_data
 * @param {String} urlTestType - test type from URL (fallback)
 */

export async function redirectToDestination(
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
        singlePageMode: true,
        autoStart: true,
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
      sendSQSMessage(
        "error", // type
        "", // sub_type (deprecated)
        redirectTo,
        redirectId,
        userId,
        "", // authType
        group,
        "", // userType
        "", // sessionId
        "", // userIpAddress
        "", // phoneNumber
        "", // batch
        "" // dateOfBirth
      );
      return false;
    }
  }

  window.open(fullURL, "_self");
  return true;
}
