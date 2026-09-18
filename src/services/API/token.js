import { fastAPIClient } from "./rootClient";
import {
  createLaunchTokenEndpoint,
  refreshTokenEndpoint,
  verifyTokenEndpoint,
} from "./endpoints";
import { storeSessionTokens, clearSessionTokens } from "./session";

const TOKEN_EXPIRED_DETAIL = "Signature has expired";

function emptyTokenResult() {
  // TODO: replace this tuple with an object return shape after callers are migrated.
  return [false, "", {}];
}

export default {
  /**
   * Keeps the tokens returned by verify/signup for this session.
   * With persist (Gurukul) they are also written as cookies.
   * @returns {boolean} whether an access token was stored
   */
  storeSessionTokens(tokens, { persist = false } = {}) {
    if (!tokens?.access_token) return false;
    storeSessionTokens(tokens, { persist });
    return true;
  },

  /**
   * Asks the backend for a short-lived launch token for the given audience.
   * The Authorization header is added by the client from the stored session.
   * @returns {Promise<Object>} { access_token } or { error }
   */
  async createLaunchToken(audience) {
    try {
      const response = await fastAPIClient.post(createLaunchTokenEndpoint, {
        audience,
      });
      return response.data;
    } catch (error) {
      console.error("Token API returned an error:", error);
      return { error };
    }
  },

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * @param {string} refresh_token - The refresh token used to obtain a new access token.
   * @returns {Promise} Resolves with the verifyToken tuple for the new access token.
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
            resolve(emptyTokenResult());
            return;
          }

          storeSessionTokens(
            { access_token: newAccessToken, refresh_token },
            { persist: true }
          );
          const verifyResult = await this.verifyToken(
            newAccessToken,
            refresh_token,
            group
          );
          resolve(verifyResult);
        })
        .catch((error) => {
          this.deleteCookies();
          resolve(emptyTokenResult());
          console.error("Token API returned an error:", error);
        });
    });
  },

  /**
   * Verifies the user's access token and checks if the user belongs to the specified group.
   *
   * @param {string} group - The group to which the user belongs.
   * @returns {Promise<[boolean, string, Object]>} A Promise that resolves with a tuple.
   *                   The resolved array has up to three elements:
   *                   - The first element (boolean) indicates whether the user belongs to the specified group.
   *                   - The second element (string) is the JWT subject (user identifier) when verification succeeds.
   *                   - The third element (object) exposes the decoded custom claims for downstream use.
   *                   If there is an error or the user doesn't belong to the group, the Promise resolves
   *                   with the empty token result tuple.
   */
  async verifyToken(access_token, refresh_token, group) {
    return new Promise((resolve) => {
      fastAPIClient
        .get(verifyTokenEndpoint, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          storeSessionTokens(
            { access_token, refresh_token },
            { persist: true }
          );
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
            error.response.data.detail == TOKEN_EXPIRED_DETAIL
          ) {
            const refreshResult = this.refreshToken(refresh_token, group);
            resolve(refreshResult);
            return;
          }
          console.error("Token API returned an error:", error);
          resolve(emptyTokenResult());
        });
    });
  },

  /**
   * Forgets the session tokens and expires the access and refresh cookies.
   */
  deleteCookies() {
    clearSessionTokens();
  },

  /**
   * Checks for user tokens and verifies the user's access to a specific group.
   *
   * @param {string} group - The group to which the user's access is being checked.
   * @returns {Promise<[boolean, string, Object]>} A Promise that resolves with an array indicating the verification result.
   *                                             The resolved array has up to three elements mirroring verifyToken.
   *                                             If there are no tokens or an error occurs, resolves with the empty token result tuple.
   */
  checkForTokens(group) {
    if (decodeURIComponent(document.cookie) == "") return emptyTokenResult();
    const cookies = {};

    let document_cookies = decodeURIComponent(document.cookie).split(";");
    for (let index = 0; index < document_cookies.length; index++) {
      const cookie = document_cookies[index];
      let [cookie_name, cookie_value] = cookie.split("=");
      if (cookie_value == undefined || cookie_value == "undefined") {
        return emptyTokenResult();
      }
      cookies[cookie_name.trim()] = cookie_value;
    }

    // Check if access_token and refresh_token are present
    if (!cookies["access_token"] || !cookies["refresh_token"]) {
      return emptyTokenResult();
    }

    return this.verifyToken(
      cookies["access_token"],
      cookies["refresh_token"],
      group
    );
  },
};
