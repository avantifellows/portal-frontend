import axios from "axios";

// const headers = {
//   Accept: "application/json",
//   "Content-Type": "application/json",
// };

/** the base URL is the deployed cloud function URL */
export const client = axios.create({
  baseURL: process.env.VUE_APP_CLOUD_FUNCTIONS_BASE_URL,
});

/** the base URL is the OTP service URL */
export const OTPClient = axios.create({
  baseURL: process.env.VUE_APP_OTP_SERVICE,
});
