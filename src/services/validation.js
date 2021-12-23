import firebaseAPI from "@/services/API/checkUser.js";

/** This function validates an entry against the database (for this usecase, it is firestore).
* firebaseAPI service is used to validate and it returns a boolean value, indicating whether the user is valid or not.
* @param {String} userID - current ID being authenticated
* @param {Number} validateCount - indicates how many times the user has been validated
* @param {String} collectionName - firestore collection against which the ID needs to be validated
* @param {String} columnName - name of the column which contains the ID
*/

async function checkPhoneNumberInFirestore(phoneNumber, collectionName, columnName){
    return await firebaseAPI.checkUserExists(phoneNumber, collectionName, columnName);
}
async function checkUserIdInFirestore(userID, validateCount, collectionName, columnName)
{
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
export async function validateID(userID, validateCount, collectionName, columnName, dataSourceType, authType){
    if(dataSourceType == "Firestore"){
        if(authType == "ID")
    {
        return checkUserIdInFirestore(userID, validateCount, collectionName, columnName)
    }
    else if(authType == "OTP")
    {
        return checkPhoneNumberInFirestore(userID, collectionName, columnName)
    }
}

}
