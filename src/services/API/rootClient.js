import axios from "axios";

/** the base URL is the deployed cloud function URL */
export const client = axios.create({
  baseURL: import.meta.env.VITE_APP_CLOUD_FUNCTIONS_BASE_URL,
});

/** the base URL is the OTP service URL */
export const OTPClient = axios.create({
  baseURL: import.meta.env.VITE_APP_OTP_SERVICE,
});

export const fastAPIClient = axios.create({
  baseURL: import.meta.env.VITE_APP_PORTAL_BACKEND,
});
