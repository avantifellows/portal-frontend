import firebaseAPI from "@/services/API/checkUser.js";

/* this function validates the entry against the database (for this usecase, it is firestore). 
firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
If the user is valid and validateCount = 0, then the function returns.
If the user is not valid and validateCount = 0, then the user is not valid, so validateCount becomes 1 and login message displays an error, allowing the user to correct their entry.
If the user is not valid and validateCount = 1, then the user has already been authenticated once before and the user has retyped, yet the entry is still invalid, then validateCount becomes 2 to indicate this behaviour.
@params {String} - userID - current ID being authenticated 
@params {Number} - validateCount - indicates how many times the user has been validated 
@params {Boolean} - isCurrentUserValid - holds the value returned by the API */
export async function validateSRN(userID, validateCount, isCurrentUserValid){
    var invalidLoginMessage = ""

    isCurrentUserValid = await firebaseAPI.checkUserExists(userID);
    if(isCurrentUserValid){
        return {
            isCurrentUserValid: isCurrentUserValid,
            validateCount: validateCount,
            invalidLoginMessage: invalidLoginMessage
            }
        }

    if (!isCurrentUserValid && validateCount == 0) {
        validateCount = 1;
        invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }

    else if(!isCurrentUserValid && validateCount == 1){
        validateCount = 2;
    }
    return {
        isCurrentUserValid: isCurrentUserValid,
        validateCount: validateCount,
        invalidLoginMessage: invalidLoginMessage
    }
}
