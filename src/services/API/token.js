import { dbClient } from "./rootClient";
import {
  createAccessTokenEndpoint,
  refreshTokenEndpoint,
  verifyTokenEndpoint,
} from "./endpoints";

export default {
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
          document.cookie = `refresh_token=${response.data.refresh_token}; Domain=avantifellows.org; Path=/; SameSite=None; Secure`;
          await this.verifyToken(group);
        })
        .catch(() => {
          resolve({ error: error });
          throw new Error("Token API returned an error:", error);
        });
    });
  },

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
            await this.refreshToken(refresh_token, group);
          }
          resolve([false, ""]);
        });
    });
  },
};
