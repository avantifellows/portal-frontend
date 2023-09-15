import userAPI from "@/services/API/user.js";
import { generateTokens } from "./generateToken";

export async function validateUser(authTypes, userInformation, userType) {
  let user = {};

  async function generateToken() {
    try {
      const tokenResponse = await generateTokens();
      if (
        tokenResponse &&
        tokenResponse.access_token &&
        tokenResponse.refresh_token
      ) {
        return { ...user, tokenResponse };
      } else {
        throw new Error("Failed to retrieve access and refresh tokens.");
      }
    } catch (error) {
      throw new Error("Error generating tokens: " + error.message);
    }
  }

  if (authTypes.includes("ID")) {
    if (userType == "student") {
      user["isUserIdValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
      });
    }
  }
  if (authTypes.includes("DOB")) {
    if (userType == "student") {
      user["isDateOfBirthValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        date_of_birth: userInformation["date_of_birth"],
      });
    }
  }
  if (authTypes.includes("PH")) {
    if (userType == "student") {
      user["isPhoneNumberValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        phone: userInformation["phone"],
      });
    }
  }
  user.tokenResponse = await generateToken();
  return user;
}
