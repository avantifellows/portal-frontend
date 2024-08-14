import { dbClient } from "./rootClient";
import {
  createAccessTokenEndpoint,
  refreshTokenEndpoint,
  verifyTokenEndpoint,
} from "./endpoints";

export default {
  /**
   * Creates an access token for a user with the specified ID and group.
   *
   * @param {string} id - The ID of the user for whom the access token is created.
   * @param {string} group - The group associated with the user.
   * @returns {Promise} A Promise that resolves when the access token is created successfully.
   *                   The Promise resolves with an object containing access_token and refresh_token.
   *                   If there is an error, it rejects with an error object.
   *
   * @throws {Error} Throws an error if the Token API returns an error during the process.
   */
  async createAccessToken(id, group) {
    const params = {
      type: "user",
      is_user_valid: true,
      id: id,
      data: { group: group },
    };
    return new Promise((resolve) => {
      dbClient
        .post(createAccessTokenEndpoint, params)
        .then((response) => {
          document.cookie = `access_token=${response.data.access_token}; Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
          document.cookie = `refresh_token=${response.data.refresh_token}; Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
          // document.cookie = `access_token=${response.data.access_token}; Path=/; SameSite=None; Secure`;
          // document.cookie = `refresh_token=${response.data.refresh_token}; Path=/; SameSite=None; Secure`;
          resolve();
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Token API returned an error:", error);
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
      dbClient
        .post(
          refreshTokenEndpoint,
          {},
          {
            headers: { Authorization: `Bearer ${refresh_token}` },
          }
        )
        .then(async (response) => {
          document.cookie = `access_token=${response.data.access_token}; Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
          // document.cookie = `access_token=${response.data.access_token}; Path=/; SameSite=None; Secure`;
          const verifyResult = await this.verifyToken(
            response.data.access_token,
            refresh_token,
            group
          );
          resolve(verifyResult);
        })
        .catch((error) => {
          this.deleteCookies();
          resolve([false, ""]);
          console.error("Token API returned an error:", error);
        });
    });
  },

  /**
   * Verifies the user's access token and checks if the user belongs to the specified group.
   *
   * @param {string} group - The group to which the user belongs.
   * @returns {Promise} A Promise that resolves with an array indicating the verification result.
   *                   The resolved array has two elements:
   *                   - The first element (boolean) indicates whether the user belongs to the specified group.
   *                   - The second element (string) is the user's ID if verification is successful.
   *                   If there is an error or the user doesn't belong to the group, the Promise resolves
   *                   with [false, ""].
   *
   * @throws {Error} Throws an error if the Token API returns an error during the verification process.
   */
  async verifyToken(access_token, refresh_token, group) {
    return new Promise((resolve) => {
      // const refreshResult = this.refreshToken(refresh_token, group);
      // resolve(refreshResult);
      dbClient
        .get(verifyTokenEndpoint, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          resolve([response.data.data.group == group, response.data.id]);
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
          resolve([false, ""]);
        });
    });
  },

  /**
   * Deletes user access and refresh tokens by setting their expiration date in the past.
   */

  deleteCookies() {
    document.cookie = `access_token=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
    document.cookie = `refresh_token=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
  },

  /**
   * Checks for user tokens and verifies the user's access to a specific group.
   *
   * @param {string} group - The group to which the user's access is being checked.
   * @returns {Promise<[boolean, string]>} A Promise that resolves with an array indicating the verification result.
   *                                     The resolved array has two elements:
   *                                     - The first element (boolean) indicates whether the user belongs to the specified group.
   *                                     - The second element (string) is the user's ID if verification is successful.
   *                                     If there are no tokens or an error occurs, the Promise resolves with [false, ""].
   */
  checkForTokens(group) {
    if (decodeURIComponent(document.cookie) == "") return [false, ""];
    const cookies = {};

    let document_cookies = decodeURIComponent(document.cookie).split(";");
    for (let index = 0; index < document_cookies.length; index++) {
      const cookie = document_cookies[index];
      let [cookie_name, cookie_value] = cookie.split("=");
      if (cookie_value == undefined || cookie_value == "undefined") {
        return [false, ""];
      }
      cookies[cookie_name.trim()] = cookie_value;
    }

    // Check if access_token and refresh_token are present
    if (!cookies["access_token"] || !cookies["refresh_token"]) {
      return [false, ""];
    }

    return this.verifyToken(
      cookies["access_token"],
      cookies["refresh_token"],
      group
    );
  },
};
