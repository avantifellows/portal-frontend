import {OTPClient} from "@/services/API/rootClient.js"
import { sendOTPEndpoint, verifyOTPEndpoint } from "@/services/API/endpoints.js";

export default {

    /** Sends OTP to the phone number */
    sendOTP(phoneNumber)
    {
        const params = {
            phone: phoneNumber
        }
        return new Promise( (resolve) => {
            OTPClient.post(sendOTPEndpoint, null, {params}).then((response) => {
                console.log(response)
                resolve(response)
            })

        })
    },
     /*  Verifies OTP entered by user */
     verifyOTP(phoneNumber, OTPCode)
     {
         const params = {
             phone: phoneNumber,
             code: OTPCode
         }
         return new Promise( (resolve) => {
             OTPClient.post(verifyOTPEndpoint, null, {params}).then((response) => {
                 resolve(response)
             })

         })
     },

}
