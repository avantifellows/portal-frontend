import firebaseAPI from "@/services/API/checkUser.js";

/** This function validates an entry against the database (for this usecase, it is firestore).
* firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
* @param {String} userID - current ID being authenticated
* @param {Number} validateCount - indicates how many times the user has been validated
*/

export async function validateSRN(userID, validateCount, collectionName, columnName){

    let isCurrentUserValid = await firebaseAPI.checkUserExists(userID, collectionName, columnName);
    if(isCurrentUserValid){
        return {
            isCurrentUserValid: isCurrentUserValid,
            validateCount: validateCount,
            }
        }

    if (validateCount == 0) {
        validateCount += 1;
    }

    else if(validateCount == 1){
        validateCount += 1;
    }
    return {
        isCurrentUserValid: isCurrentUserValid,
        validateCount: validateCount,
    }
}
