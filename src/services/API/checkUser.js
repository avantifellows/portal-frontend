import axios from 'axios';

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

//the base URL is the deployed cloud function URL
const client = axios.create({baseURL: 'https://us-central1-avantifellows.cloudfunctions.net'}, headers)

export default {
    //checks if the user exists in the database or not
    checkUserExists(inputUserID)
    {
        //sending the entered userID to firebase for checking
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
            