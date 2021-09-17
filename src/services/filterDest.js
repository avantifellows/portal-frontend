import { redirectToPlio, redirectToMeet } from "@/services/API/sendDest";

export function filterDestination(redirectTo, purposeParams, userID, redirectID){
    if(purposeParams == "plio"){
        redirectToPlio( userID, redirectID);
    }
    else if(purposeParams == "liveclass"){
        if(redirectTo=="meet"){
            redirectToMeet(redirectID)
        }
    }

}