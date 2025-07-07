import userAPI from "@/services/API/user.js";

async function checkBirthdateInFirestore(
  birthdate,
  userID,
  collectionName,
  columnName
) {
  return await userAPI.doesBirthdateMatch(birthdate, userID, collectionName);
}

/** This function validates an entry with the database
 * @param {String} userID - current ID being validated
 * @param {Number} validateCount - indicates how many times the user has been validated
 * @param {String} isExtraInputValidationRequired - indicates if there are any extra fields being validated
 */
async function checkUserIDInDB(
  userID,
  validateCount,
  isExtraInputValidationRequired,
  group
) {
  let isCurrentUserValid = await userAPI.verifyUser(userID, group);

  if (isCurrentUserValid.error) {
    this.toast.error("Network Error, please try again!", {
      position: "top-center",
      timeout: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  }
  if (!isExtraInputValidationRequired) {
    if (isCurrentUserValid) {
      return {
        isCurrentUserValid: isCurrentUserValid,
        validateCount: validateCount,
      };
    }

    if (validateCount == 0 || validateCount == 1) {
      validateCount += 1;
    }
    return {
      isCurrentUserValid: isCurrentUserValid,
      validateCount: validateCount,
    };
  } else {
    return isCurrentUserValid;
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
  return user;
}

/** This function checks the data source to see which database API needs to be called.
 * @param {String} userID - current ID being validated
 * @param {String} authType - the authentication method the user has used
 * @param {Number} validateCount - indicates how many times the user has been validated
 * @param {Object} birthdate - contains the month, day and year
 * @param {Boolean} isExtraInputValidationRequired - indicates if there are any extra fields being validated
 */
export async function validateID(
  userID,
  authType,
  validateCount = 0,
  birthdate,
  isExtraInputValidationRequired,
  phoneNumber,
  group
) {
  if (
    group == "Candidates" ||
    group == "EnableStudents" ||
    group == "HimachalStudents" ||
    group == "DelhiStudents" ||
    group == "NGOStudents" ||
    group == "DMVSStudents" ||
    group == "PunjabStudents" ||
    group == "PunjabTeachers"
  ) {
    let isCurrentUserValid = await userAPI.verifyUser(userID, group);
    let isBirthdateValid = true;
    if (authType.includes("DOB")) {
      isBirthdateValid = await checkBirthdateInFirestore(
        birthdate,
        userID,
        group,
        "date_of_birth"
      );
    }
    return {
      isCurrentUserValid: isCurrentUserValid && isBirthdateValid,
      validateCount: 0,
    };
  }
  {
    if (authType.includes("ID")) {
      let userValidationResponse = await checkUserIDInDB(
        userID,
        validateCount,
        isExtraInputValidationRequired,
        group
      );
      if (isExtraInputValidationRequired) {
        if (userValidationResponse) {
          if (authType.includes("DOB")) {
            let dob =
              birthdate.year +
              "-" +
              (birthdate.month < 10 ? "0" + birthdate.month : birthdate.month) +
              "-" +
              (birthdate.day < 10 ? "0" + birthdate.day : birthdate.day);

            var isBirthdateValid = await userAPI.verifyStudent({
              student_id: userID,
              date_of_birth: dob,
              auth_group: group,
            });
            return userValidationResponse && isBirthdateValid;
          }
          if (authType.includes("PH")) {
            var isPhoneNumberValid = await userAPI.verifyStudent({
              student_id: userID,
              phone: phoneNumber,
              auth_group: group,
            });
            return userValidationResponse && isPhoneNumberValid;
          }
        }
      }
      return userValidationResponse;
    }
    if (authType.includes("OTP")) {
      return userAPI.verifyStudent({
        phone_number: userID,
      });
    }
  }
}
