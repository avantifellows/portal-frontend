import firebaseAPI from "@/services/API/checkUser.js";

/** This function validates an entry against the database (for this usecase, it is firestore). 
* firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
* @param {String} userID - current ID being authenticated 
* @param {Number} validateCount - indicates how many times the user has been validated 
*/

export async function validateSRN(userID, validateCount){
    var invalidLoginMessage = ""

    var isCurrentUserValid = await firebaseAPI.checkUserExists(userID);
    if(isCurrentUserValid){
        return {
            isCurrentUserValid: isCurrentUserValid,
            validateCount: validateCount,
            invalidLoginMessage: invalidLoginMessage
            }
        }

    if (validateCount == 0) {
        validateCount = 1;
        invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }

    else if(validateCount == 1){
        validateCount = 2;
    }
    return {
        isCurrentUserValid: isCurrentUserValid,
        validateCount: validateCount,
        invalidLoginMessage: invalidLoginMessage
    }
}
