import firebaseAPI from "@/services/API/checkUser.js";

/** This function validates a phone number against Firestore.
 * firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
 * @param {String} phoneNumber - phone number being validated
 * @param {String} collectionName - firestore collection against which the ID needs to be validated
 * @param {String} columnName - name of the column which contains the ID
 */
async function checkPhoneNumberInFirestore(
  phoneNumber,
  collectionName,
  columnName
) {
  return await firebaseAPI.checkUserExists(
    phoneNumber,
    collectionName,
    columnName
  );
}

/** This function validates an entry against Firestore.
 * firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
 * @param {String} userID - current ID being validated
 * @param {Number} validateCount - indicates how many times the user has been validated
 * @param {String} collectionName - firestore collection against which the ID needs to be validated
 * @param {String} columnName - name of the column which contains the ID
 */
async function checkUserIdInFirestore(
  userID,
  validateCount,
  collectionName,
  columnName
) {
  let isCurrentUserValid = await firebaseAPI.checkUserExists(
    userID,
    collectionName,
    columnName
  );
  if (isCurrentUserValid.error) {
    this.toast.error("Network Error, please try again!", {
      position: "top-center",
      timeout: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  }
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
}

/** This function checks the data source to see which database API needs to be called.
 * @param {String} userID - current ID being validated
 * @param {String} dataSource - contains information about where and how the data is stored.
 * @param {String} authType - the authentication method the user has used
 * @param {Number} validateCount - indicates how many times the user has been validated
 */
export async function validateID(
  userID,
  dataSource,
  authType,
  validateCount = 0
) {
  if (dataSource["type"] == "Firestore") {
    if (authType == "ID") {
      return checkUserIdInFirestore(
        userID,
        validateCount,
        dataSource["name"],
        dataSource["column"]
      );
    }
    if (authType == "OTP") {
      return checkPhoneNumberInFirestore(
        userID,
        dataSource["name"],
        dataSource["column"]
      );
    }
  }
}
