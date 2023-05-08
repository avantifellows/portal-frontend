import userAPI from "@/services/API/user.js";

/** This function validates an entry with the database
 * @param {String} userID - current ID being validated
 * @param {Number} validateCount - indicates how many times the user has been validated
 * @param {String} isExtraInputValidationRequired - indicates if there are any extra fields being validated
 */
async function checkUserIDInDB(
  userID,
  validateCount,
  isExtraInputValidationRequired
) {
  let isCurrentUserValid = await userAPI.verifyStudent({ student_id: userID });
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
  phoneNumber
) {
  if (authType.includes("ID")) {
    let userValidationResponse = await checkUserIDInDB(
      userID,
      validateCount,
      isExtraInputValidationRequired
    );
    if (isExtraInputValidationRequired) {
      if (userValidationResponse) {
        if (authType.includes("DOB")) {
          let dob =
            (birthdate.day < 10 ? "0" + birthdate.day : birthdate.day) +
            "-" +
            (birthdate.month < 10 ? "0" + birthdate.month : birthdate.month) +
            "-" +
            birthdate.year;
          var isBirthdateValid = await userAPI.verifyStudent({
            student_id: userID,
            birth_date: dob,
          });
          return userValidationResponse && isBirthdateValid;
        }
        if (authType.includes("PH")) {
          console.log(authType);
          var isPhoneNumberValid = await userAPI.verifyStudent({
            student_id: userID,
            phone_number: phoneNumber,
          });
          console.log(isPhoneNumberValid);
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
