import {client} from "@/API/rootClient.js"
import { checkUserEndpoint } from "@/API/endpoints.js";

export default {
    //checks if the user exists in the database or not
    checkUserExists(inputUserID)
    {
        //sending the entered userID to firebase for checking
        const params = {
            userID : inputUserID
        }
        return new Promise( (resolve) => {
            client.post(checkUserEndpoint, JSON.stringify(params)).then((response) => {
                resolve(response.data)
            })
            
        })
    }
} 
            
