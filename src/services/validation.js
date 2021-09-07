import firebaseAPI from "@/services/API/checkUser.js";
import { sendPlio } from "@/services/sendPlio";
import {sendSQSMessage} from "@/services/API/sqs";

//this function is invoked only for the check of SRN's.
export async function validateSRN(userID, validateCount, isSingleEntryOnly, redirectID, doesUserExist, purpose, purposeParams, redirectTo){

    var invalidLoginMessage = ""
    //checks the basic conditions of SRN: 
    //      - starts with only '1'
    //      - does not contain same number patterns like '111...', '222...', etc.
    if(!(/^([0-9])\1*$/.test(userID)) && userID.toString()[0] == '1'){

        //if the basic conditions are satisified, only then the request is sent for further checking
        doesUserExist = await firebaseAPI.checkUserExists(userID);
    }

    // this condition checks if the user is getting authenticated the first time. Just shows an error message.
    if (!doesUserExist && validateCount == 0) {
    validateCount = 1;
    invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }
    //this condition checks the second time, since still not valid, just changes the flag and continues with the plio.
    else if (!doesUserExist && validateCount == 1) {
    validateCount = 2;
    sendSQSMessage(purpose, purposeParams, redirectTo, redirectID, userID, doesUserExist);
    sendPlio(isSingleEntryOnly, userID, redirectID);
    } else {
    sendSQSMessage(purpose, purposeParams, redirectTo, redirectID, userID, doesUserExist);
    sendPlio(isSingleEntryOnly, userID, redirectID);
    }
    return {
        doesUserExist: doesUserExist,
        validateCount: validateCount,
        invalidLoginMessage: invalidLoginMessage
    }
}