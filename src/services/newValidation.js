import userAPI from "@/services/API/user.js";

export async function validateUser(
  authTypes,
  userInformation,
  userType,
  groupId
) {
  let user = {};
  if (authTypes.includes("ID")) {
    if (userType == "student") {
      user["isUserIdValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        group_id: groupId,
      });
    }
  }
  if (authTypes.includes("DOB")) {
    if (userType == "student") {
      user["isDateOfBirthValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        date_of_birth: userInformation["date_of_birth"],
        group_id: groupId,
      });
    }
  }
  if (authTypes.includes("PH")) {
    if (userType == "student") {
      user["isPhoneNumberValid"] = await userAPI.verifyStudent({
        student_id: userInformation["student_id"],
        phone: userInformation["phone"],
        group_id: groupId,
      });
    }
  }
  return user;
}
