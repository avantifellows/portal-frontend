import axios from "axios";

/** the base URL is the deployed cloud function URL */
export const client = axios.create(
  { baseURL: "https://us-central1-avantifellows.cloudfunctions.net" }
);

const OTPHeaders = {
  "x-api-key": process.env.VUE_APP_OTP_API_KEY,
};

/** the base URL is the OTP service URL */
export const OTPClient = axios.create(
  { baseURL: process.env.VUE_APP_OTP_SERVICE, headers: OTPHeaders }
);
