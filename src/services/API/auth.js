import { client } from "./rootClient";

export default {
  createAccessToken(userIdList) {
    return new Promise((resolve) => {
      client
        .post("/auth/create-access-token", {
          id: userIdList[0]["userID"],
          is_user_valid: userIdList[0]["valid"],
          type: "user",
        })

        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("JWT API returned an error:", error);
        });
    });
  },
};
