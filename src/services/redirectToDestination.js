import { sendSQSMessage } from "@/services/API/sqs";
import TokenAPI from "@/services/API/token";

/** Redirects user to the appropriate destination platform
 * @param {String} userId - user ID for authentication
 * @param {String} [displayId] - display ID for user-facing contexts
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
  displayId,
  omrMode,
  abTestId,
  redirectId,
  redirectLink,
  redirectTo,
  group,
  testType,
  urlTestType,
  launchContext = null
) {
  const reportDisplayId = displayId || userId;
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

  const buildLaunchToken = async (audience) => {
    if (!launchContext?.subjectId || !launchContext?.group) {
      return null;
    }

    const tokenResponse = await TokenAPI.createLaunchToken({
      subjectId: launchContext.subjectId,
      group: launchContext.group,
      identifiers: launchContext.identifiers || {},
      profile: launchContext.profile || null,
      audience,
    });

    return tokenResponse?.access_token || null;
  };

  switch (actualRedirectTo) {
    case "AF-plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_AF_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_AF_API_KEY,
        unique_id: reportDisplayId,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "SCERT-plio": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_SCERT_PLIO;
      let url = new URL(redirectURL + redirectId);
      finalURLQueryParams = new URLSearchParams({
        api_key: import.meta.env.VITE_APP_PLIO_SCERT_API_KEY,
        unique_id: reportDisplayId,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "quiz": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_QUIZ;
      let url = new URL(redirectURL + redirectId);
      const launchToken = await buildLaunchToken("quiz");

      if (!launchToken) {
        console.error("Unable to mint quiz launch token", launchContext);
        return false;
      }

      finalURLQueryParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_APP_QUIZ_AF_API_KEY,
        omrMode: omrMode,
        launchToken,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "form": {
      redirectURL = import.meta.env.VITE_APP_BASE_URL_FORM;
      let url = new URL(redirectURL + redirectId);
      const launchToken = await buildLaunchToken("form");

      if (!launchToken) {
        console.error("Unable to mint form launch token", launchContext);
        return false;
      }

      finalURLQueryParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_APP_QUIZ_AF_API_KEY,
        singlePageMode: true,
        autoStart: true,
        launchToken,
      });
      fullURL = url + "?" + finalURLQueryParams;
      break;
    }
    case "report": {
      if (effectiveTestType === "form") {
        redirectURL = import.meta.env.VITE_APP_FORM_REPORT_BASE_URL;
      } else {
        redirectURL = import.meta.env.VITE_APP_STUDENT_QUIZ_REPORT_BASE_URL;
      }

      const launchToken = await buildLaunchToken("report");

      if (!launchToken) {
        console.error("Unable to mint report launch token", launchContext);
        return false;
      }

      const reportUrl = new URL(`${redirectURL}/${redirectId}`);
      reportUrl.searchParams.set("launchToken", launchToken);
      fullURL = reportUrl.toString();
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
