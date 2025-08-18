import { fastAPIClient } from "@/services/API/rootClient.js";

export default {
  /**
   * Get dependant field mapping for district->school or district->block->school
   * @param {String} authGroup - auth group name (e.g., "DelhiStudents")
   * @param {Boolean} includeBlocks - whether to include block hierarchy
   */
  getDependantMapping(authGroup, includeBlocks = false) {
    return new Promise((resolve) => {
      fastAPIClient
        .get(`/school/dependant-mapping/${authGroup}`, {
          params: {
            include_blocks: includeBlocks,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error(
            "School dependant mapping API returned an error:",
            error
          );
        });
    });
  },

  /**
   * Get list of colleges/universities for forms
   */
  getColleges() {
    return new Promise((resolve) => {
      fastAPIClient
        .get("/school/colleges")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Colleges API returned an error:", error);
        });
    });
  },

  /**
   * Get list of states from database
   */
  getStates() {
    return new Promise((resolve) => {
      fastAPIClient
        .get("/school/states")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("States API returned an error:", error);
        });
    });
  },
};
