import { createAccessTokenEndpoint } from "./endpoints";
import axios from "axios";

export function setToken(apiKey, userId) {
  return fetch(
    import.meta.env.VITE_APP_PORTAL_BACKEND + createAccessTokenEndpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_user_valid: true,
        id: userId,
        data: {
          apiKey: apiKey,
        },
      }),
    }
  );
}
