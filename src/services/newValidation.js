import userAPI from "@/services/API/user.js";

export async function validateUser(
  authTypes,
  userInformation,
  userType,
  authGroupId
) {
  let user = {};

  if (authTypes.includes("ID")) {
    if (userType == "student") {
      user["isUserIdValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        auth_group_id: authGroupId,
      });
    }
    if (userType == "teacher") {
      user["isUserIdValid"] = await userAPI.verifyTeacher({
        teacher_id: userInformation["teacher_id"],
      });
    }
  }
  if (authTypes.includes("DOB")) {
    if (userType == "student") {
      user["isDateOfBirthValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        date_of_birth: userInformation["date_of_birth"],
        auth_group_id: authGroupId,
      });
    }
  }
  if (authTypes.includes("PH")) {
    if (userType == "student") {
      user["isPhoneNumberValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        phone: userInformation["phone"],
        auth_group_id: authGroupId,
      });
    }
  }
  if (authTypes.includes("CODE")) {
    if (userType == "school") {
      user["isCodeValid"] = await userAPI.verifySchool({
        code: userInformation["code"],
      });
    }
  }
  return user;
}
