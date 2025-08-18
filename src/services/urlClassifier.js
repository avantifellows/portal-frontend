/**
 * URL Classification Service for Portal V2
 * Handles different types of authentication URLs
 */

/**
 * URL Types:
 * - LANDING: Home page with no parameters
 * - SESSION_BASED: URLs with sessionId - traditional session flow
 * - SESSIONLESS_AUTH: Direct platform access without sessions (gurukul, reports)
 * - ERROR: Invalid parameter combinations
 */
export const URL_TYPES = {
  LANDING: "landing",
  SESSION_BASED: "session_based",
  SESSIONLESS_AUTH: "sessionless_auth",
  ERROR: "error",
};

/**
 * Platforms that support sessionless authentication
 */
const SESSIONLESS_PLATFORMS = ["gurukul", "report", "teacher-web-app"];

/**
 * Classify the current URL based on provided parameters
 * @param {Object} params - Route parameters
 * @returns {Object} Classification result with type and config
 */
export function classifyURL(params) {
  const { sessionId, platform, platform_id, platform_link, type, authGroup } =
    params;

  // Landing page - incomplete parameters that don't constitute a valid auth flow
  if (
    !sessionId &&
    (!platform || !SESSIONLESS_PLATFORMS.includes(platform) || !authGroup)
  ) {
    return {
      type: URL_TYPES.LANDING,
      requiresSession: false,
      requiresAuth: false,
    };
  }

  // Session-based URLs - traditional flow with sessionId
  if (sessionId) {
    return {
      type: URL_TYPES.SESSION_BASED,
      requiresSession: true,
      requiresAuth: true,
      sessionId,
      authFlow: type || "sign-in",
    };
  }

  // Sessionless authentication - direct platform access
  if (platform && SESSIONLESS_PLATFORMS.includes(platform)) {
    if (!authGroup) {
      return {
        type: URL_TYPES.ERROR,
        error: "Sessionless URLs require authGroup parameter",
      };
    }

    return {
      type: URL_TYPES.SESSIONLESS_AUTH,
      requiresSession: false,
      requiresAuth: true,
      platform,
      platform_id,
      platform_link,
      authGroup,
      authFlow: type || "sign-in",
    };
  }

  // Invalid parameter combination
  return {
    type: URL_TYPES.ERROR,
    error: "Invalid URL parameters - missing sessionId or unsupported platform",
  };
}

/**
 * Check if URL requires session data loading
 */
export function requiresSessionData(urlType) {
  return urlType === URL_TYPES.SESSION_BASED;
}

/**
 * Check if URL requires authentication
 */
export function requiresAuthentication(urlType) {
  return (
    urlType === URL_TYPES.SESSION_BASED ||
    urlType === URL_TYPES.SESSIONLESS_AUTH
  );
}

/**
 * Get appropriate auth group handling strategy
 */
export function getAuthGroupStrategy(classification) {
  switch (classification.type) {
    case URL_TYPES.SESSION_BASED:
      return {
        source: "session_data",
        fallback: "default_group",
      };
    case URL_TYPES.SESSIONLESS_AUTH:
      return {
        source: "url_params",
        authGroup: classification.authGroup,
      };
    default:
      return {
        source: "default_group",
        authGroup: "AFTesting",
      };
  }
}
