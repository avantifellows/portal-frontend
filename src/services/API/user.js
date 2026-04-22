import { fastAPIClient } from "@/services/API/rootClient.js";
import {
  verifyStudentEndpoint,
  verifyTeacherEndpoint,
  verifyCandidateEndpoint,
  verifySchoolEndpoint,
  getStudentEndpoint,
  getTeacherEndpoint,
  getCandidateEndpoint,
  getSchoolEndpoint,
  userSignupEndpoint,
} from "@/services/API/endpoints.js";

function getFirstRecord(data) {
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data || null;
}

function flattenProfileRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const user =
    record.user && typeof record.user === "object" ? record.user : {};
  const school =
    record.school && typeof record.school === "object" ? record.school : {};

  return {
    ...record,
    ...school,
    ...user,
    school_id: record.school_id ?? school.id ?? null,
    school_code:
      record.school_code ??
      school.school_code ??
      school.code ??
      record.code ??
      null,
    code: record.code ?? school.code ?? null,
    school_name:
      record.school_name ?? school.school_name ?? school.name ?? null,
  };
}

export default {
  /**
   * Validates that the ID exists
   * @param {String} userID - the id that needs to be validated
   */
  verifyStudent(studentData) {
    return new Promise((resolve) => {
      fastAPIClient
        .get(verifyStudentEndpoint, { params: studentData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response && error.response.status == 404) {
            resolve({ is_valid: false });
          } else {
            console.error("User API returned an error:", error);
            resolve({ is_valid: false });
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
      fastAPIClient
        .get(verifyTeacherEndpoint, { params: teacherData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response && error.response.status == 404) {
            resolve({ is_valid: false });
          } else {
            console.error("User API returned an error:", error);
            resolve({ is_valid: false });
          }
        });
    });
  },

  /**
   * Validates that the ID exists
   * @param {String} candidateId - the id that needs to be validated
   */
  verifyCandidate(candidateData) {
    return new Promise((resolve) => {
      fastAPIClient
        .get(verifyCandidateEndpoint, { params: candidateData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response && error.response.status == 404) {
            resolve({ is_valid: false });
          } else {
            console.error("User API returned an error:", error);
            resolve({ is_valid: false });
          }
        });
    });
  },

  /**
   * Validates that the code exists
   * @param {String} schoolCode - the code that needs to be validated
   */
  verifySchool(schoolData) {
    return new Promise((resolve) => {
      fastAPIClient
        .get(verifySchoolEndpoint, { params: schoolData })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) resolve(false);
          else {
            throw new Error("School API returned an error:", error);
          }
        });
    });
  },

  async getProfileForToken(userType, identifiers = {}) {
    let endpoint = null;
    let params = null;

    if (userType === "student") {
      endpoint = getStudentEndpoint;
      params = {
        user_id:
          identifiers.user_id ??
          identifiers.student_id ??
          identifiers.apaar_id ??
          null,
        student_id: identifiers.student_id ?? null,
        apaar_id: identifiers.apaar_id ?? null,
      };
    } else if (userType === "teacher") {
      endpoint = getTeacherEndpoint;
      params = {
        teacher_id: identifiers.teacher_id ?? null,
      };
    } else if (userType === "candidate") {
      endpoint = getCandidateEndpoint;
      params = {
        candidate_id: identifiers.candidate_id ?? null,
      };
    } else if (userType === "school") {
      endpoint = getSchoolEndpoint;
      params = {
        code: identifiers.school_code ?? identifiers.code ?? null,
      };
    } else {
      return null;
    }

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value)
    );

    if (Object.keys(filteredParams).length === 0) {
      return null;
    }

    try {
      const response = await fastAPIClient.get(endpoint, {
        params: filteredParams,
      });
      return flattenProfileRecord(getFirstRecord(response.data));
    } catch (error) {
      console.error("User profile hydration failed:", error);
      return null;
    }
  },

  /**
   * Creates a new user
   * @param {Object} formData - contains data filled in the form by user
   */
  userSignup(formData, idGeneration, userType, authGroup) {
    return new Promise((resolve) => {
      fastAPIClient
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
          resolve(response.data);
        })
        .catch((error) => {
          resolve({ error: error });
          throw new Error(error);
        });
    });
  },

  /** Posts profile data that a student has entered
   * @param {Object} data - student data
   */
  completeProfile(data) {
    return new Promise((resolve) => {
      fastAPIClient
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

  postUserSessionActivity(
    userId,
    userActivityType,
    sessionId,
    userType,
    sessionOccurrenceId
  ) {
    return new Promise((resolve) => {
      fastAPIClient
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
