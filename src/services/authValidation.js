import userAPI from "@/services/API/user.js";

export async function validateUser(
  authTypes,
  userInformation,
  userType,
  authGroupId,
  authGroupName
) {
  let user = {};

  user["identifiers"] = null;

  const sanitizeIdentifiers = ({
    user_id = null,
    display_id = null,
    display_id_type = null,
  }) => {
    const identifiers = {};

    const safeUserId =
      user_id !== undefined && user_id !== null && user_id !== ""
        ? String(user_id)
        : null;
    const safeDisplayId =
      display_id !== undefined && display_id !== null && display_id !== ""
        ? String(display_id)
        : null;
    const safeDisplayIdType = display_id_type || null;

    if (safeUserId) identifiers["user_id"] = safeUserId;
    if (safeDisplayId) identifiers["display_id"] = safeDisplayId;
    if (safeDisplayIdType) identifiers["display_id_type"] = safeDisplayIdType;

    return Object.keys(identifiers).length > 0 ? identifiers : null;
  };

  if (userType == "student") {
    let studentVerificationParams = {
      auth_group_id: authGroupId,
    };

    if (authTypes.includes("ID")) {
      studentVerificationParams["student_id"] = userInformation["student_id"];
    }

    if (authTypes.includes("DOB")) {
      studentVerificationParams["date_of_birth"] =
        userInformation["date_of_birth"];
    }

    if (authTypes.includes("PH")) {
      studentVerificationParams["phone"] = userInformation["phone"];
    }

    let verificationResult = await userAPI.verifyStudent(
      studentVerificationParams
    );

    const isValid = Boolean(verificationResult && verificationResult.is_valid);

    if (authTypes.includes("ID")) {
      user["isUserIdValid"] = isValid;
    }
    if (authTypes.includes("DOB")) {
      user["isDateOfBirthValid"] = isValid;
    }
    if (authTypes.includes("PH")) {
      user["isPhoneNumberValid"] = isValid;
    }

    if (isValid) {
      const verifiedStudentId =
        verificationResult.student_id ?? userInformation["student_id"] ?? null;
      const verifiedApaarId =
        verificationResult.apaar_id ?? userInformation["apaar_id"] ?? null;
      const canonicalUserId =
        verificationResult.user_id ??
        userInformation["user_id"] ??
        userInformation["student_id"] ??
        null;

      const typedStudentId = userInformation["student_id"] ?? null;
      const typedApaarId = userInformation["apaar_id"] ?? null;

      let displayId = null;
      let displayIdType = null;

      if (typedStudentId) {
        displayId = typedStudentId;
        displayIdType = "student_id";
      } else if (typedApaarId) {
        displayId = typedApaarId;
        displayIdType = "apaar_id";
      } else if (verifiedStudentId) {
        displayId = verifiedStudentId;
        displayIdType = "student_id";
      } else if (verifiedApaarId) {
        displayId = verifiedApaarId;
        displayIdType = "apaar_id";
      }

      user["identifiers"] = {
        student_id: verifiedStudentId,
        apaar_id: verifiedApaarId,
        user_id: canonicalUserId,
        display_id: displayId,
        display_id_type: displayIdType,
      };
    }
  }

  if (userType == "candidate" && authTypes.includes("ID")) {
    const verificationResult = await userAPI.verifyCandidate({
      candidate_id: userInformation["candidate_id"],
    });

    const isValid = Boolean(verificationResult && verificationResult.is_valid);
    user["isUserIdValid"] = isValid;

    if (isValid) {
      const identifiers = sanitizeIdentifiers({
        user_id:
          verificationResult.user_id ??
          userInformation["user_id"] ??
          userInformation["candidate_id"] ??
          null,
        display_id:
          verificationResult.display_id ??
          userInformation["candidate_id"] ??
          null,
        display_id_type: verificationResult.display_id_type ?? "candidate_id",
      });

      if (identifiers) {
        user["identifiers"] = identifiers;
      }
    }
  }

  if (
    userType == "teacher" &&
    (authTypes.includes("ID") || authTypes.includes("CODE"))
  ) {
    const verificationResult = await userAPI.verifyTeacher({
      teacher_id: userInformation["teacher_id"],
    });

    const isValid = Boolean(verificationResult && verificationResult.is_valid);

    if (authTypes.includes("ID")) {
      user["isUserIdValid"] = isValid;
    }
    if (authTypes.includes("CODE")) {
      user["isCodeValid"] = isValid;
    }

    if (isValid) {
      const identifiers = sanitizeIdentifiers({
        user_id:
          verificationResult.user_id ??
          userInformation["user_id"] ??
          userInformation["teacher_id"] ??
          null,
        display_id:
          verificationResult.display_id ??
          userInformation["teacher_id"] ??
          null,
        display_id_type: verificationResult.display_id_type ?? "teacher_id",
      });

      if (identifiers) {
        user["identifiers"] = identifiers;
      }
    }
  }

  if (userType == "school" && authTypes.includes("CODE")) {
    user["isCodeValid"] = await userAPI.verifySchool({
      code: userInformation["code"],
    });
  }

  return user;
}
