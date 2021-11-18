import axios from 'axios';

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

/** the base URL is the deployed cloud function URL */
export const client = axios.create({baseURL: 'https://us-central1-avantifellows.cloudfunctions.net'}, headers)
