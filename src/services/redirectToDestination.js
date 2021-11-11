import { sendSQSMessage } from "@/services/API/sqs";

/** this is function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built. 
* @param {String} purposeparams - extracted from auth layer URL
* @param {Array} userIDList - list of userID's wanting to go through the layer 
* @param {String} redirectID - extracted from auth layer URL
* @param {String} redirectTo - extracted from auth layer URL
* @param {String} authType - extracted from auth layer URL 
*/

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
