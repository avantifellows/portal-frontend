import { dbClient } from "./rootClient";
import { createAccessTokenEndpoint } from "./endpoints";

export async function createAccessToken(id) {
  const params = {
    type: "user",
    is_user_valid: true,
    id: id,
  };
  return new Promise((resolve) => {
    dbClient
      .post(createAccessTokenEndpoint, params)
      .then((response) => {
        document.cookie = `access_token=${response.data.access_token}; domain=staging-gurkul.avantifellows.com; path=/; Secure; SameSite=None`;
        document.cookie = `refresh_token=${response.data.refresh_token}; domain=staging-gurkul.avantifellows.com; path=/; Secure; SameSite=None`;
      })
      .catch((error) => {
        resolve({ error: error });
        throw new Error("Session API returned an error:", error);
      });
  });
}
