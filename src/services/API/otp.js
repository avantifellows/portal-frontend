import { OTPClient } from "@/services/API/rootClient.js";
import {
  sendOTPEndpoint,
  verifyOTPEndpoint,
} from "@/services/API/endpoints.js";

export default {
  /** Sends OTP to the phone number */
  sendOTP(phoneNumber) {
    const params = {
      phone: phoneNumber,
    };
    return new Promise((resolve) => {
      OTPClient.post(sendOTPEndpoint, null, { params }).then((response) => {
        // Parse JSON response from Lambda if needed
        if (typeof response.data === "string") {
          response.data = JSON.parse(response.data);
        }
        resolve(response);
      });
    });
  },
  /** Verifies OTP entered by user */
  verifyOTP(phoneNumber, OTPCode) {
    const params = {
      phone: phoneNumber,
      code: OTPCode,
    };
    return new Promise((resolve) => {
      OTPClient.post(verifyOTPEndpoint, null, { params }).then((response) => {
        // Parse JSON response from Lambda if needed
        if (typeof response.data === "string") {
          response.data = JSON.parse(response.data);
        }
        resolve(response);
      });
    });
  },
};
