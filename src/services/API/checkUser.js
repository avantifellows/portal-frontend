import {client} from "@/services/API/rootClient.js"
import { checkUserEndpoint } from "@/services/API/endpoints.js";

export default {
    /**
      * Validates that the ID exists
      * @param {String} inputUserID - the id that needs to be validated
      */
    checkUserExists(inputUserID, collectionName, columnName)
    {
        const params = {
            userID : inputUserID,
            collectionName: collectionName,
            columnName: columnName
        }
        return new Promise( (resolve) => {
            client.post(checkUserEndpoint, JSON.stringify(params)).then((response) => {
                resolve(response.data)
            })

        })
    }
}
