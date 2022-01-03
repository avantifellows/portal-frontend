export const mapVerifyStatusCodeToMessage = {
    311: "This OTP does not exist / यह OTP मौजूद नहीं है",
    309: "You have exceeded maximum number of attempts. Please try after sometime / आप प्रयासों की अधिकतम संख्या को पार कर चुके हैं। कृपया कुछ देर बाद प्रयास करें",
    301: "OTP token is expired / OTP टोकन की समय सीमा समाप्त हो गई है",
    310: "This OTP is incorrect / यह OTP गलत है",
    308: "You are re-trying too early. Please wait for sometime / आप बहुत जल्दी पुनः प्रयास कर रहे हैं। कृपया कुछ देर प्रतीक्षा करें ",
  }

  export function mapSendStatusCodeToMessage(code) {
    return code == 200 ? "OTP has been sent! / OTP भेज दिया गया है!" : "Unable to send OTP. Try again?"

  }
