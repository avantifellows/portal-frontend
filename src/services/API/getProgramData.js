import {client} from "@/services/API/rootClient.js"
import { getProgramDataEndpoint } from "@/services/API/endpoints.js";

export default {
    /**
      * Validates that the ID exists
      * @param {String} inputUserID - the id that needs to be validated
      */
    getProgramData()
    {
        const params = {
            program : "HaryanaStudents_hi"
        }
        console.log("HERE!")
        return new Promise( (resolve) => {
            client.post(getProgramDataEndpoint, JSON.stringify(params)).then((response) => {
                resolve(response.data)
            })

        })
    }
}
