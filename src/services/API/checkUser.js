//import { functions } from "..";
import axios from 'axios';

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

const client = axios.create({baseURL: 'https://us-central1-avantifellows.cloudfunctions.net'}, headers)

export default {
    checkUserExists(inputUserID)
    {
        const params = {
            userID : inputUserID
        }
        return new Promise( (resolve) => {
            client.post('/checkForUser', JSON.stringify(params)).then((response) => {
                resolve(response.data)
            })
            
        })
    }
} 
            