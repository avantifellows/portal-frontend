import { dbClient } from "./API/rootClient";
import { createAccessToken } from "./API/endpoints";

export async function generateTokens() {
    try {
        const response = await dbClient.post(createAccessToken);
        return response.data;
    } catch (error) {
        throw new Error('Error generating tokens: ' + error.message);
    }
}
