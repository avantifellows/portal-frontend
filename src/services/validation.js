import firebaseAPI from "@/services/API/checkUser.js";
import { sendPlio } from "@/services/sendPlio";
import {sendSQSMessage} from "@/services/API/sqs";

// this function is invoked only for the check of SRN's.
// validateCount = 0, when the user gets validated on the first try
// validateCount = 1, when the user fails the first validation

export async function validateSRN(userID, validateCount, isSingleEntryOnly, redirectID, doesUserExist, purpose, purposeParams, redirectTo){
    var authType="SRN"
    var invalidLoginMessage = ""

    //checks the basic condition of SRN: 
    //      - does not contain same number patterns like '111...', '222...', etc.
    if(!(/^([0-9])\1*$/.test(userID))){

        //if the basic conditions are satisified, only then the request is sent for further checking
        doesUserExist = await firebaseAPI.checkUserExists(userID);
    }

    // this condition checks if the user is getting authenticated the first time. Just shows an error message.
    if (!doesUserExist && validateCount == 0) {
        validateCount = 1;
        invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }

    //this condition is entered in one of the three conditions:
    //  - either the user is found the first time -> doesUserExist = true, validateCount = 0
    //  - either the user is found the second time -> doesUserExist = true, validateCount = 1
    //  - either the user is not found the second time -> doesUserExist = false, validateCount = 1
    else{
        sendSQSMessage(purpose, purposeParams, redirectTo, redirectID, userID, doesUserExist, authType);
        sendPlio(isSingleEntryOnly, userID, redirectID);
    }

    return {
        doesUserExist: doesUserExist,
        validateCount: validateCount,
        invalidLoginMessage: invalidLoginMessage
    }
}
