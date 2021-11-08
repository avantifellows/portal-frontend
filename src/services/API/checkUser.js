import {client} from "@/services/API/rootClient.js"
import { checkUserEndpoint } from "@/services/API/endpoints.js";

export default {
    /* this method validates the ID against the database
    @params {String} inputUserID - each ID being typed*/
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
            
