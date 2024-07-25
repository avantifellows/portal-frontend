import userAPI from "@/services/API/user.js";

export async function validateUser(
  authTypes,
  userInformation,
  userType,
  authGroupId
) {
  let user = {};

  let studentVerificationParams = {
    student_id: userInformation["student_id"],
    auth_group_id: authGroupId,
  };

  if (authTypes.includes("DOB")) {
    studentVerificationParams["date_of_birth"] =
      userInformation["date_of_birth"];
  }

  if (authTypes.includes("PH")) {
    studentVerificationParams["phone"] = userInformation["phone"];
  }

  if (userType == "student") {
    if (
      authTypes.includes("ID") ||
      authTypes.includes("DOB") ||
      authTypes.includes("PH")
    ) {
      let verificationResult = await userAPI.verifyStudent(
        studentVerificationParams
      );

      if (authTypes.includes("ID")) {
        user["isUserIdValid"] = verificationResult;
      }
      if (authTypes.includes("DOB")) {
        user["isDateOfBirthValid"] = verificationResult;
      }
      if (authTypes.includes("PH")) {
        user["isPhoneNumberValid"] = verificationResult;
      }
    }
  }

  if (userType == "teacher" && authTypes.includes("ID")) {
    user["isUserIdValid"] = await userAPI.verifyTeacher({
      teacher_id: userInformation["teacher_id"],
    });
  }

  if (userType == "school" && authTypes.includes("CODE")) {
    user["isCodeValid"] = await userAPI.verifySchool({
      code: userInformation["code"],
    });
  }

  return user;
}
