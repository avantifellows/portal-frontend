import { sendSQSMessage } from "@/services/API/sqs";

/** This is function is called when a user has to be redirected to the destination. Depending on the destination, the destination URL is built.
* @param {String} purposeparams - extracted from auth layer URL
* @param {Array} userIDList - list of userIDs wanting to go through the layer
* @param {String} redirectID - extracted from auth layer URL
* @param {String} redirectTo - extracted from auth layer URL
* @param {String} authType - extracted from auth layer URL
*/

export function redirectToDestination(purposeParams, userIDList, redirectID, redirectTo, authType, program){
    let redirectURL = "";
    let fullURL = "";
    let queryParams = "";

    switch(redirectTo){
        case 'plio':
            let userID = userIDList[0]["userID"]
            redirectURL = process.env.VUE_APP_BASE_URL_PLIO;
            let url = new URL(redirectURL + redirectID);
            queryParams = new URLSearchParams({
                                api_key: process.env.VUE_APP_API_KEY,
                                unique_id: userID,
                                });
            fullURL = url + "?" + queryParams;
            break;

        case 'meet':
            redirectURL = process.env.VUE_APP_BASE_URL_MEET;
            fullURL = new URL(redirectURL + redirectID);
            break;

        case 'zoom':
            fullURL = redirectID
            break;

        case 'teacher-web-app':
            queryParams = new URLSearchParams({
                teacherID: userID,
                programID: program
                });
            fullURL = process.env.VUE_APP_TEACHER_WEB_APP_URL + "?" + queryParams;
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

    window.open(fullURL, "_self");
    return true
}
