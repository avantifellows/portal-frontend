export function filterDestination(redirectTo, purposeParams, userID, redirectID){
    var redirectURL = "";
    var fullurl = "";

    switch(purposeParams){
        case 'plio':
            //this method constructs the URL based on the redirectTo param
            redirectURL = process.env.VUE_APP_BASE_URL_PLIO;
            var url = new URL(redirectURL + redirectID); //adds plioID to the base plio link
            //adds params; api key and student SRN
            var queryparams = new URLSearchParams({
                                api_key: process.env.VUE_APP_AF_API_KEY,
                                unique_id: userID,
                                });
            fullurl = url + "?" + queryparams;
            break;

        case 'liveclass':
            //this method constructs the URL based on the redirectTo param
            redirectURL = process.env.VUE_APP_BASE_URL_MEET;
            fullurl = new URL(redirectURL + redirectID); //adds meetID to the base plio link
            break;
        }
        
    window.open(fullurl, "_self");
}