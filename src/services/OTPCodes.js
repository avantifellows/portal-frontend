export const mapVerifyStatusCodeToMessage = {
    311: "This OTP does not exist",
    309: "You have exceeded maximum number of attempts. Please try after sometime.",
    301: "OTP token is expired.",
    310: "This OTP is incorrect.",
    308: "You are re-trying too early. Please wait for sometime.",
  }

  export function mapSendStatusCodeToMessage(code) {
    return code == "200" ? "OTP has been sent!" : "Oh no!"

  }
