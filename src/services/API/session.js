const DEFAULT_COOKIE_DOMAIN = "avantifellows.org";
const COOKIE_DOMAIN =
  import.meta.env.VITE_APP_COOKIE_DOMAIN || DEFAULT_COOKIE_DOMAIN;

let accessToken = null;
let refreshToken = null;
let persistToCookies = false;

function isLocalHostname(hostname) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }
  if (hostname === "::1" || hostname === "0.0.0.0") {
    return true;
  }
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function resolveCookieDomain(hostname) {
  if (isLocalHostname(hostname)) return "";
  if (hostname === COOKIE_DOMAIN || hostname.endsWith(`.${COOKIE_DOMAIN}`)) {
    return COOKIE_DOMAIN;
  }
  return "";
}

function buildCookieAttributes() {
  const hostname = window.location.hostname;
  const isLocal = isLocalHostname(hostname);
  const isSecure = window.location.protocol === "https:";
  const domain = resolveCookieDomain(hostname);
  const sameSite = !isLocal && isSecure ? "None" : "Lax";
  const attributes = [`Path=/`, `SameSite=${sameSite}`];

  if (isSecure) {
    attributes.push("Secure");
  }
  if (domain) {
    attributes.push(`Domain=${domain}`);
  }

  return attributes.join("; ");
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}; ${buildCookieAttributes()}`;
}

function clearCookie(name) {
  const hostname = window.location.hostname;
  const expires = "Expires=Thu, 01 Jan 1970 00:00:01 GMT";
  const domain = resolveCookieDomain(hostname);

  document.cookie = `${name}=; ${expires}; Path=/`;
  if (domain) {
    document.cookie = `${name}=; ${expires}; Path=/; Domain=${domain}`;
  }
}

/**
 * Remembers the session tokens for this page load and, when persist is set
 * (Gurukul), also writes them as cookies for silent login later.
 */
export function storeSessionTokens(
  tokens = {},
  { persist = persistToCookies } = {}
) {
  persistToCookies = Boolean(persist);
  const { access_token, refresh_token } = tokens;

  if (access_token) {
    accessToken = access_token;
    if (persistToCookies) setCookie("access_token", access_token);
  }

  // A response that omits refresh_token (access-only refresh) keeps the current one;
  // an explicitly empty value (AFTesting) clears it so no earlier user's token lingers.
  if (!("refresh_token" in tokens)) return;
  if (refresh_token) {
    refreshToken = refresh_token;
    if (persistToCookies) setCookie("refresh_token", refresh_token);
  } else {
    refreshToken = null;
    clearCookie("refresh_token");
  }
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearSessionTokens() {
  accessToken = null;
  refreshToken = null;
  persistToCookies = false;
  clearCookie("access_token");
  clearCookie("refresh_token");
}
