import { sendPlio, sendMeet } from "@/services/API/sendDest";

export function filterDestination(redirectTo, purposeParams, userID, redirectID){
    console.log(purposeParams)
    if(purposeParams == "plio"){
        sendPlio( userID, redirectID);
    }
    else if(purposeParams == "liveclass"){
        if(redirectTo=="meet"){
            sendMeet(redirectID)
        }
    }

}