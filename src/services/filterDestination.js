import { redirectToPlio, redirectToMeet } from "@/services/API/redirectToDestination.js";

export function filterDestination(redirectTo, purposeParams, userID, redirectID){
    switch(purposeParams){
        case 'plio':
            redirectToPlio( userID, redirectID);
            break;
        case 'liveclass':
            redirectToMeet(redirectID)
            break;
        }
}