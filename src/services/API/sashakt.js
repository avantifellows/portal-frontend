import { fastAPIClient } from "./rootClient";
import { createSashaktLaunchEndpoint } from "./endpoints";

export default {
  async createLaunch(data) {
    const response = await fastAPIClient.post(
      createSashaktLaunchEndpoint,
      data
    );
    return response.data;
  },
};
