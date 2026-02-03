import { fastAPIClient } from "./rootClient";
import {
  createAccessTokenEndpoint,
  refreshTokenEndpoint,
  verifyTokenEndpoint,
} from "./endpoints";

const DEFAULT_COOKIE_DOMAIN = "avantifellows.org";
const COOKIE_DOMAIN =
  import.meta.env.VITE_APP_COOKIE_DOMAIN || DEFAULT_COOKIE_DOMAIN;

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

export default {
  /**
   * Creates an access token for a user with the specified identifiers and group.
   *
   * @param {Object} options - Token creation options.
   * @param {string} options.subjectId - Identifier used for the JWT subject (defaults to user_id from identifiers if present).
   * @param {string} options.group - Auth group associated with the user.
   * @param {Object} [options.identifiers] - Optional identifier bundle to embed in the token
   *                   (student_id, apaar_id, user_id, display_id, display_id_type).
   * @returns {Promise} A Promise that resolves when the access token is created successfully.
   *                   The Promise resolves with an object containing access_token and refresh_token.
   *                   If there is an error, it rejects with an error object.
   *
   * @throws {Error} Throws an error if the Token API returns an error during the process.
   */
  async createAccessToken({ subjectId, group, identifiers = {} }) {
    const canonicalUserId = String(identifiers.user_id ?? subjectId ?? "");

    if (!group || canonicalUserId === "") {
      console.error(
        "Token creation failed: Missing group or canonical user identifier",
        {
          group,
          subjectId,
          identifiers,
        }
      );
      return { error: "Missing required token parameters" };
    }

    const tokenData = { group };

    if (identifiers.student_id) {
      tokenData.student_id = identifiers.student_id;
    }
    if (identifiers.apaar_id) {
      tokenData.apaar_id = identifiers.apaar_id;
    }
    if (identifiers.display_id) {
      tokenData.display_id = identifiers.display_id;
    }
    if (identifiers.display_id_type) {
      tokenData.display_id_type = identifiers.display_id_type;
    }

    tokenData.user_id = canonicalUserId;

    const params = {
      type: "user",
      is_user_valid: true,
      id: canonicalUserId,
      data: tokenData,
    };
    return new Promise((resolve) => {
      fastAPIClient
        .post(createAccessTokenEndpoint, params)
        .then((response) => {
          const accessToken = response.data.access_token;
          const refreshToken = response.data.refresh_token;

          if (accessToken) {
            setCookie("access_token", accessToken);
          }

          if (refreshToken) {
            setCookie("refresh_token", refreshToken);
          }

          resolve();
        })
        .catch((error) => {
          console.error("Token API returned an error:", error);
          resolve({ error: error });
        });
    });
  },

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * @param {string} refresh_token - The refresh token used to obtain a new access token.
   * @returns {Promise} A Promise that resolves when the access token is refreshed successfully.
   *                   The Promise resolves with an object containing access_token.
   *                   If there is an error, it rejects with an error object.
   *
   * @throws {Error} Throws an error if the Token API returns an error during the refresh process.
   */
  async refreshToken(refresh_token, group) {
    return new Promise((resolve) => {
      fastAPIClient
        .post(
          refreshTokenEndpoint,
          {},
          {
            headers: { Authorization: `Bearer ${refresh_token}` },
          }
        )
        .then(async (response) => {
          const newAccessToken = response.data.access_token;

          if (!newAccessToken) {
            this.deleteCookies();
            resolve([false, "", {}]);
            return;
          }

          setCookie("access_token", newAccessToken);
          const verifyResult = await this.verifyToken(
            newAccessToken,
            refresh_token,
            group
          );
          resolve(verifyResult);
        })
        .catch((error) => {
          this.deleteCookies();
          resolve([false, "", {}]);
          console.error("Token API returned an error:", error);
        });
    });
  },

  /**
   * Verifies the user's access token and checks if the user belongs to the specified group.
   *
   * @param {string} group - The group to which the user belongs.
   * @returns {Promise} A Promise that resolves with an array indicating the verification result.
   *                   The resolved array has up to three elements:
   *                   - The first element (boolean) indicates whether the user belongs to the specified group.
   *                   - The second element (string) is the JWT subject (user identifier) when verification succeeds.
   *                   - The third element (object) exposes the decoded custom claims for downstream use.
   *                   If there is an error or the user doesn't belong to the group, the Promise resolves
   *                   with [false, "", {}].
   *
   * @throws {Error} Throws an error if the Token API returns an error during the verification process.
   */
  async verifyToken(access_token, refresh_token, group) {
    return new Promise((resolve) => {
      // const refreshResult = this.refreshToken(refresh_token, group);
      // resolve(refreshResult);
      fastAPIClient
        .get(verifyTokenEndpoint, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          resolve([
            response.data.data.group == group,
            response.data.id,
            response.data.data,
          ]);
        })
        .catch(async (error) => {
          if (
            error.response &&
            error.response.status == 422 &&
            error.response.data.detail == "Signature has expired"
          ) {
            const refreshResult = this.refreshToken(refresh_token, group);
            resolve(refreshResult);
          }
          console.error("Token API returned an error:", error);
          resolve([false, "", {}]);
        });
    });
  },

  /**
   * Deletes user access and refresh tokens by setting their expiration date in the past.
   */

  deleteCookies() {
    clearCookie("access_token");
    clearCookie("refresh_token");
  },

  /**
   * Checks for user tokens and verifies the user's access to a specific group.
   *
   * @param {string} group - The group to which the user's access is being checked.
   * @returns {Promise<[boolean, string, Object]>} A Promise that resolves with an array indicating the verification result.
   *                                             The resolved array has up to three elements mirroring verifyToken.
   *                                             If there are no tokens or an error occurs, the Promise resolves with [false, "", {}].
   */
  checkForTokens(group) {
    if (decodeURIComponent(document.cookie) == "") return [false, "", {}];
    const cookies = {};

    let document_cookies = decodeURIComponent(document.cookie).split(";");
    for (let index = 0; index < document_cookies.length; index++) {
      const cookie = document_cookies[index];
      let [cookie_name, cookie_value] = cookie.split("=");
      if (cookie_value == undefined || cookie_value == "undefined") {
        return [false, "", {}];
      }
      cookies[cookie_name.trim()] = cookie_value;
    }

    // Check if access_token and refresh_token are present
    if (!cookies["access_token"] || !cookies["refresh_token"]) {
      return [false, "", {}];
    }

    return this.verifyToken(
      cookies["access_token"],
      cookies["refresh_token"],
      group
    );
  },
};
