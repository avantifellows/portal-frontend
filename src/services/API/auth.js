import { client } from "./rootClient";
import { createAccessTokenEndpoint } from "@/services/API/endpoints.js";

export default {
  createAccessToken(userIdList) {
    return new Promise((resolve) => {
      client
        .post(createAccessTokenEndpoint, {
          id: userIdList[0]["userID"],
          is_user_valid: userIdList[0]["valid"],
          type: "user",
        })

        .then((response) => {
          document.cookie = "access_token" + response.data.access_token;
          document.cookie = "refresh_token" + response.data.refresh_token;
          resolve(response);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("JWT API returned an error:", error);
        });
    });
  },
};
