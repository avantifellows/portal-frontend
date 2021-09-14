export function sendPlio(isSingleEntryOnly, userID, redirectID) {
    if (isSingleEntryOnly) {
      //this method constructs the URL based on the redirectTo param
      const redirectURL = process.env.VUE_APP_BASE_URL_PLIO;
      let url = new URL(redirectURL + redirectID); //adds plioID to the base plio link
      //adds params; api key and student SRN
      let queryparams = new URLSearchParams({
        api_key: process.env.VUE_APP_AF_API_KEY,
        unique_id: userID,
      });
      let fullurl = url + "?" + queryparams;
      window.open(fullurl, "_self");
    }
  }