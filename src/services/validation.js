import firebaseAPI from "@/services/API/checkUser.js";
import { sendPlio } from "./sendPlio";

export async function validateUser(userID, validateCount, isSingleEntryOnly, redirectID, doesUserExist){
    //response tells us if the user is authenticated.
    if(!(/^([0-9])\1*$/.test(userID)) && userID.toString()[0] == '1'){
        doesUserExist = await firebaseAPI.checkUserExists(userID);
    }
    // this condition checks if the user is getting authenticated the first time. Just shows an error message.
    if (!doesUserExist && validateCount == 0) {
    validateCount = 1;
    var invalidLoginMessage = "Please enter correct SRN / कृपया सही SRN दर्ज करें";
    }
    //this condition checks the second time, since still not valid, just changes the flag and continues with the plio.
    else if (!doesUserExist && validateCount == 1) {
    validateCount = 2;
    sendPlio(isSingleEntryOnly, userID, redirectID);
    } else {
    sendPlio(isSingleEntryOnly, userID, redirectID);
    }
    return [doesUserExist, validateCount, invalidLoginMessage]
}