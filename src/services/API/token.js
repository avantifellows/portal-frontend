import { fastAPIClient } from "./rootClient";
import {
  createAccessTokenEndpoint,
  refreshTokenEndpoint,
  verifyTokenEndpoint,
} from "./endpoints";

const TOKEN_COOKIE_OPTIONS = ["Path=/", "SameSite=None", "Secure"];

const isTopLevelDomainHost = () => {
  if (typeof window === "undefined" || !window.location?.hostname) {
    return false;
  }
  return window.location.hostname.endsWith("avantifellows.org");
};

const setTokenCookie = (name, value) => {
  if (typeof document === "undefined") return;

  const encodedValue = encodeURIComponent(value);
  const baseAttributes = TOKEN_COOKIE_OPTIONS.join("; ");

  document.cookie = `${name}=${encodedValue}; ${baseAttributes}`;

  if (isTopLevelDomainHost()) {
    document.cookie = `${name}=${encodedValue}; Domain=.avantifellows.org; ${baseAttributes}`;
  }
};

const clearTokenCookie = (name) => {
  if (typeof document === "undefined") return;

  const expiredAttributes = [
    ...TOKEN_COOKIE_OPTIONS,
    "Expires=Thu, 01 Jan 1970 00:00:01 GMT",
  ].join("; ");

  document.cookie = `${name}=; ${expiredAttributes}`;

  if (isTopLevelDomainHost()) {
    document.cookie = `${name}=; Domain=.avantifellows.org; ${expiredAttributes}`;
  }
};

const persistToken = (key, value) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Unable to persist token in localStorage", error);
  }
};

const removePersistedToken = (key) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Unable to clear token from localStorage", error);
  }
};

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
    const candidateSubject =
      identifiers.user_id !== undefined && identifiers.user_id !== null
        ? identifiers.user_id
        : subjectId;

    const canonicalUserId =
      candidateSubject !== undefined &&
      candidateSubject !== null &&
      candidateSubject !== ""
        ? String(candidateSubject)
        : "";

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
            setTokenCookie("access_token", accessToken);
            persistToken("access_token", accessToken);
          }

          if (refreshToken) {
            setTokenCookie("refresh_token", refreshToken);
            persistToken("refresh_token", refreshToken);
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

          setTokenCookie("access_token", newAccessToken);
          persistToken("access_token", newAccessToken);

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
    clearTokenCookie("access_token");
    clearTokenCookie("refresh_token");
    removePersistedToken("access_token");
    removePersistedToken("refresh_token");
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
