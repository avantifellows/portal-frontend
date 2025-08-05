import axios from "axios";

/** OTP service - Lambda function endpoints */
export const OTPClient = axios.create({
  baseURL: import.meta.env.VITE_APP_OTP_SERVICE,
});

/** Portal backend - FastAPI endpoints */
export const fastAPIClient = axios.create({
  baseURL: import.meta.env.VITE_APP_PORTAL_BACKEND,
});
