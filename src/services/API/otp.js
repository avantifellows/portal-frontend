import {OTPClient} from "@/services/API/rootClient.js"
import { sendOTPEndpoint, verifyOTPEndpoint } from "@/services/API/endpoints.js";

export default {
    //checks if the user exists in the database or not
    sendOTP(phoneNumber)
    {
        //sending the entered userID to firebase for checking
        const params = {
            phone: phoneNumber
        }
        return new Promise( (resolve) => {
            OTPClient.post(sendOTPEndpoint, null, {params}).then((response) => {
                resolve(response)
            })

        })
    },
     //checks if the user exists in the database or not
     verifyOTP(phoneNumber, OTPCode)
     {
         //sending the entered userID to firebase for checking
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
