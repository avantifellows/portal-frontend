import {client} from "@/services/API/rootClient.js"
import { checkUserEndpoint } from "@/services/API/endpoints.js";

export default {
    /**
      * validates that the ID exists
      * @param {String} inputUserID - the id that needs to be validated
      */
    checkUserExists(inputUserID)
    {
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
            
