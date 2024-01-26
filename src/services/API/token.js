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
   *                   The Promise resolves with an object containing access_token and refresh_token.
   *                   If there is an error, it rejects with an error object.
   *
   * @throws {Error} Throws an error if the Token API returns an error during the refresh process.
   */
  async refreshToken(refresh_token) {
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
          document.cookie = `refresh_token=${response.data.refresh_token}; Domain=avantifellows.org; Path=/; SameSite=None; Secure`;

          return;
        })
        .catch(() => {
          resolve({ error: error });
          throw new Error("Token API returned an error:", error);
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
  async verifyToken(group) {
    if (decodeURIComponent(document.cookie) == "") return [false, ""];

    let cookies = decodeURIComponent(document.cookie).split(";");
    let access_token = cookies[0].split("=")[1];
    let refresh_token = cookies[1].split("=")[1];

    return new Promise((resolve) => {
      dbClient
        .get(verifyTokenEndpoint, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          resolve([response.data.data.group == group, response.data.id]);
        })
        .catch(async (error) => {
          if (
            error.response.status == 422 &&
            error.response.data.detail == "Signature has expired"
          ) {
            await this.refreshToken(refresh_token);
            await this.verifyToken(group);
          }
          resolve([false, ""]);
        });
    });
  },
};
