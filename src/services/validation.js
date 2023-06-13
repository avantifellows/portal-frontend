import userAPI from "@/services/API/user.js";

export async function validateUser(authTypes, userInformation) {
  if (authTypes.includes("ID")) {
    let isCurrentUserValid = await userAPI.verifyStudent({
      student_id: userInformation["student_id"],
    });
    return isCurrentUserValid;
  } else if (authTypes.includes("DOB")) {
    let isCurrentUserValid = await userAPI.verifyStudent({
      student_id: userInformation["student_id"],
      birth_date: userInformation["birthdate"],
    });
    return isCurrentUserValid;
  } else if (authTypes.includes("PH")) {
    let isCurrentUserValid = await userAPI.verifyStudent({
      student_id: userInformation["student_id"],
      phone_number: userInformation["phone_number"],
    });
    return isCurrentUserValid;
  }
}
