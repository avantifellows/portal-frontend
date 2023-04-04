import userAPI from "@/services/API/user.js";

/** This function validates an entry against Firestore.
 * firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
 * @param {String} userID - current ID being validated
 * @param {Number} validateCount - indicates how many times the user has been validated
 * @param {String} collectionName - firestore collection against which the ID needs to be validated
 * @param {String} columnName - name of the column which contains the ID
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
  isExtraInputValidationRequired
) {
  if (isExtraInputValidationRequired) {
    let isBirthdateValid = await userAPI.verifyStudent({
      birthdate: birthdate,
    });

    return isBirthdateValid;
  } else {
    if (authType.includes("ID")) {
      return checkUserIDInDB(
        userID,
        validateCount,
        isExtraInputValidationRequired
      );
    }
    if (authType.includes("OTP")) {
      return userAPI.verifyStudent({
        phone_number: userID,
      });
    }
  }
}
