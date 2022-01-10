/** The object maps OTP verification status codes to user-readable messages.*/
export const mapVerifyStatusCodeToMessage = {
  311: {
    message: "This OTP does not exist / यह OTP मौजूद नहीं है",
    status: "failure",
  },
  309: {
    message:
      "You have exceeded maximum number of attempts. Please try after sometime / आप प्रयासों की अधिकतम संख्या को पार कर चुके हैं। कृपया कुछ देर बाद प्रयास करें",
    status: "failure",
  },
  301: {
    message: "OTP token is expired / OTP टोकन की समय सीमा समाप्त हो गई है",
    status: "failure",
  },
  310: { message: "This OTP is incorrect / यह OTP गलत है", status: "failure" },
  308: {
    message:
      "You are re-trying too early. Please wait for sometime / आप बहुत जल्दी पुनः प्रयास कर रहे हैं। कृपया कुछ देर प्रतीक्षा करें ",
    status: "failure",
  },
};

/** The object maps OTP sent status codes to user-readable messages.
 * @param {Number} code - the OTP code
 */
export function mapSendStatusCodeToMessage(message) {
  return message === "success"
    ? {
        message: "OTP has been sent! / OTP भेज दिया गया है!",
        status: "success",
      }
    : {
        message:
          "Unable to send OTP. Please wait for sometime and try again / OTP भेजने में असमर्थ. कृपया कुछ देर प्रतीक्षा करें और पुनः प्रयास करें",
        status: "failure",
      };
}
