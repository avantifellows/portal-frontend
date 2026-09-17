import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  storeSessionTokens,
} from "@/services/API/session.js";
import { refreshTokenEndpoint } from "@/services/API/endpoints.js";

const TOKEN_EXPIRED_DETAIL = "Signature has expired";

/** OTP service - Lambda function endpoints */
export const OTPClient = axios.create({
  baseURL: import.meta.env.VITE_APP_OTP_SERVICE,
});

/** Portal backend - FastAPI endpoints */
export const fastAPIClient = axios.create({
  baseURL: import.meta.env.VITE_APP_PORTAL_BACKEND,
});

fastAPIClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return config;
});

function isExpiredTokenError(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;
  return status === 401 || (status === 422 && detail === TOKEN_EXPIRED_DETAIL);
}

// /auth/* routes manage their own tokens; everything else retries once after a refresh.
fastAPIClient.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const refreshToken = getRefreshToken();

  if (
    !config ||
    config._retried ||
    !refreshToken ||
    !isExpiredTokenError(error) ||
    String(config.url || "").startsWith("/auth/")
  ) {
    return Promise.reject(error);
  }

  config._retried = true;
  try {
    const response = await fastAPIClient.post(
      refreshTokenEndpoint,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
    const accessToken = response.data?.access_token;
    if (!accessToken) return Promise.reject(error);

    storeSessionTokens({ access_token: accessToken });
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return fastAPIClient.request(config);
  } catch (refreshError) {
    return Promise.reject(error);
  }
});
