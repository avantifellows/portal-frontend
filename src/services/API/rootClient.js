import axios from "axios";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** the base URL is the deployed cloud function URL */
export const client = axios.create(
  { baseURL: "https://us-central1-avantifellows.cloudfunctions.net" },
  headers
);

const OTPHeaders = {
  "x-api-key": process.env.VUE_APP_OTP_API_KEY,
};
/** the base URL is the OTP service URL */
export const OTPClient = axios.create(
  { baseURL: process.env.VUE_APP_OTP_SERVICE },
  OTPHeaders
);
