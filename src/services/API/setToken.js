import { createAccessTokenEndpoint } from "./endpoints";

export function setToken(apiKey, unique_id) {
  return fetch(createAccessTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_user_valid: true,
      id: unique_id,
      data: {
        apiKey: apiKey,
      },
    }),
  });
}
