import {client} from "@/services/API/rootClient.js"
import { getProgramDataEndpoint } from "@/services/API/endpoints.js";

export default {
    /**
      * Validates that the ID exists
      * @param {String} programName - the name of the program whose data needs to be retrieved
      */
    getProgramData(programName)
    {

        const params = {
            program : programName
        }
        return new Promise( (resolve) => {
            client.post(getProgramDataEndpoint, JSON.stringify(params)).then((response) => {
                resolve(response.data)
            })

        })
    }
}
