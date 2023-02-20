import { createAccessTokenEndpoint } from "./endpoints";
import axios from "axios";

export function setToken(apiKey, userId) {
  return axios.post(
    import.meta.env.VITE_APP_PORTAL_BACKEND + createAccessTokenEndpoint,
    {
      is_user_valid: true,
      id: userId,
      data: {
        apiKey: apiKey,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
