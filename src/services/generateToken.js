import { dbClient } from "./API/rootClient";
import { createAccessToken } from "./API/endpoints";

export async function generateTokens(userID) {
  const params = {
    id: userID,
    type: "user",
    is_user_valid: true,
  };
  console.log(params, "params");
  try {
    const response = await dbClient.post(createAccessToken, params);
    return response.data;
  } catch (error) {
    throw new Error("Error generating tokens: " + error.message);
  }
}
