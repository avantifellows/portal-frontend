import { sendSQSMessage } from "@/services/API/sqs";

/* this is function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built. 
Following are the usecases so far:
- if the destination is Plio, the url is built with the following:
        - the Plio website's base URL (stored in environment variable)
        - the Plio ID (from auth layer URL, redirectID)
        - queryparams: Plio's API key (stored in environment variable) and unique ID (user ID) 
- if the destination is a google meet class, the url is built with the following:
        - the meet's base URL (stored in environment variable)
        - the meeting ID (from auth layer URL, redirectID) 
- if the destination is none of the above, then an SQS message with purpose = 'Error' is sent to keep a log of.
@params {String} purposeparams - extracted from auth layer URL
@params {Array} userIDList - list of userID's wanting to go through the layer 
@params {String} redirectID - extracted from auth layer URL
@params {String} redirectTo - extracted from auth layer URL
@params {String} authType - extracted from auth layer URL */
export function redirectToDestination(purposeParams, userIDList, redirectID, redirectTo, authType){
    var redirectURL = "";
    var fullurl = "";
    
    switch(purposeParams){
        case 'plio':    
            var userID = userIDList[0]["userID"]
            redirectURL = process.env.VUE_APP_BASE_URL_PLIO;
            var url = new URL(redirectURL + redirectID); 
            var queryparams = new URLSearchParams({
                                api_key: process.env.VUE_APP_AF_API_KEY,
                                unique_id: userID,
                                });
            fullurl = url + "?" + queryparams;
            break;

        case 'liveclass':           
            redirectURL = process.env.VUE_APP_BASE_URL_MEET;
            fullurl = new URL(redirectURL + redirectID);
            break;
        
        default:
            var purpose = 'Error'
            sendSQSMessage(
                purpose,
                purposeParams,
                redirectTo,
                redirectID,
                userIDList,
                authType
              );
            return false
        }
        
    window.open(fullurl, "_self");
    return true
}
