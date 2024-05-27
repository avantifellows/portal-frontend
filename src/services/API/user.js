import { client, dbClient } from "@/services/API/rootClient.js";
import {
  studentSignupEndpoint,
  userSignupEndpoint,
  verifyStudentEndpoint,
  checkForUserEndpoint,
  checkBirthdateEndpoint,
  verifyAIETStudentEndpoint,
  verifyTeacherEndpoint,
} from "@/services/API/endpoints.js";

export default {
  /**
   * Validates that the ID exists
   * @param {String} userID - the id that needs to be validated
   */
  verifyStudent(studentData) {
    return new Promise((resolve) => {
      dbClient
        .get(verifyStudentEndpoint, { params: studentData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },

  /**
   * Validates that the ID exists
   * @param {String} teacherId - the id that needs to be validated
   */
  verifyTeacher(teacherData) {
    return new Promise((resolve) => {
      dbClient
        .get(verifyTeacherEndpoint, { params: teacherData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },

  /**
   * Creates a new user
   * @param {Object} formData - contains data filled in the form by user
   */
  newUserSignup(formData, idGeneration, userType, authGroup) {
    return new Promise((resolve) => {
      dbClient
        .post(
          userSignupEndpoint,
          JSON.stringify({
            form_data: formData,
            id_generation: idGeneration,
            user_type: userType,
            auth_group: authGroup,
          })
        )
        .then((response) => {
          resolve(response.data.toString());
        })
        .catch((error) => {
          console.log(error);
          resolve({ error: error });
          throw new Error(error);
        });
    });
  },
  userSignup(formData) {
    return new Promise((resolve) => {
      client
        .post("/userSignup", JSON.stringify(formData))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

  /** Posts profile data that a student has entered
   * @param {Object} data - student data
   */
  studentData(data) {
    return new Promise((resolve) => {
      dbClient
        .post("/student/complete-profile-details", data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("Form API returned an error:", error);
        });
    });
  },

  /**
   * Creates a new student
   * @param {Object} formData - contains data filled in the form by user
   */
  studentSignup(formData) {
    return new Promise((resolve) => {
      client
        .post(studentSignupEndpoint, JSON.stringify(formData))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

  verifyUser(userId, collectionName) {
    const params = {
      userID: userId,
      collectionName: collectionName,
    };
    return new Promise((resolve) => {
      client
        .post(checkForUserEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

  doesBirthdateMatch(birthdate, userID, collectionName) {
    const params = {
      userID: userID,
      collectionName: collectionName,
      dob: birthdate,
    };

    return new Promise((resolve) => {
      client
        .post(checkBirthdateEndpoint, JSON.stringify(params))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },

  verifyAIETStudent(data) {
    return new Promise((resolve) => {
      client
        .post(verifyAIETStudentEndpoint, JSON.stringify(data))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            throw new Error("User API returned an error:", error);
          }
        });
    });
  },

  postUserSessionActivity(
    userId,
    userActivityType,
    sessionId,
    userType,
    sessionOccurrenceId
  ) {
    return new Promise((resolve) => {
      dbClient
        .post("/user-session", {
          user_id: userId,
          user_activity_type: userActivityType,
          session_id: sessionId,
          user_type: userType,
          session_occurrence_id: sessionOccurrenceId,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error("User API returned an error:", error);
        });
    });
  },
};
