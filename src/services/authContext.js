function normalizeValue(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return String(value);
}

function pickDefined(source, keys) {
  const result = {};

  keys.forEach((key) => {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });

  return result;
}

function pickFirst(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function emptyToNull(section) {
  return Object.keys(section).length > 0 ? section : null;
}

export function buildAuthContext({
  userInformation = {},
  identifiers = {},
  group = null,
  userType = null,
} = {}) {
  const merged = { ...userInformation, ...identifiers };
  const canonicalUserId = normalizeValue(
    identifiers.user_id ?? merged.user_id ?? merged.id
  );
  const authGroup = normalizeValue(group ?? merged.group);

  if (!canonicalUserId || !authGroup) {
    return null;
  }

  const displayId = normalizeValue(
    identifiers.display_id ??
      pickFirst(merged, [
        "display_id",
        "student_id",
        "apaar_id",
        "teacher_id",
        "candidate_id",
        "school_code",
        "code",
      ]) ??
      canonicalUserId
  );
  const displayIdType =
    identifiers.display_id_type ??
    merged.display_id_type ??
    (displayId === normalizeValue(merged.student_id)
      ? "student_id"
      : displayId === normalizeValue(merged.apaar_id)
      ? "apaar_id"
      : displayId === normalizeValue(merged.teacher_id)
      ? "teacher_id"
      : displayId === normalizeValue(merged.candidate_id)
      ? "candidate_id"
      : displayId === normalizeValue(merged.school_code) ||
        displayId === normalizeValue(merged.code)
      ? "school_code"
      : "user_id");

  const resolvedUserType =
    userType ??
    merged.user_type ??
    merged.role ??
    (merged.teacher_id
      ? "teacher"
      : merged.candidate_id
      ? "candidate"
      : merged.code || merged.school_code
      ? "school"
      : "student");

  const tokenIdentifiers = {
    user_id: canonicalUserId,
    display_id: displayId,
    display_id_type: displayIdType,
  };

  [
    "student_id",
    "apaar_id",
    "teacher_id",
    "candidate_id",
    "school_code",
    "code",
  ].forEach((key) => {
    const value = normalizeValue(merged[key]);
    if (value) {
      tokenIdentifiers[key] = value;
    }
  });

  const profile = {
    auth: {
      user_id: canonicalUserId,
      group: authGroup,
      user_type: resolvedUserType,
      display_id: displayId,
      display_id_type: displayIdType,
    },
    user: emptyToNull(
      pickDefined(merged, [
        "first_name",
        "last_name",
        "name",
        "phone",
        "email",
        "gender",
        "date_of_birth",
      ])
    ),
    student:
      resolvedUserType === "student"
        ? emptyToNull(
            pickDefined(merged, [
              "student_id",
              "apaar_id",
              "grade_id",
              "grade",
              "stream",
              "status",
              "g12_graduating_year",
              "school_id",
              "school_code",
              "school_name",
            ])
          )
        : null,
    teacher:
      resolvedUserType === "teacher"
        ? emptyToNull(
            pickDefined(merged, [
              "teacher_id",
              "designation",
              "subject_id",
              "subject",
              "is_af_teacher",
              "school_id",
              "school_code",
              "school_name",
            ])
          )
        : null,
    candidate:
      resolvedUserType === "candidate"
        ? emptyToNull(
            pickDefined(merged, [
              "candidate_id",
              "subject_id",
              "subject",
              "degree",
              "college_name",
              "branch_name",
            ])
          )
        : null,
    school:
      resolvedUserType === "school" || merged.school_code || merged.code
        ? emptyToNull(
            pickDefined(merged, [
              "school_code",
              "code",
              "school_name",
              "name",
              "udise_code",
              "state",
              "district",
              "region",
              "block_name",
            ])
          )
        : null,
  };

  return {
    subjectId: canonicalUserId,
    group: authGroup,
    identifiers: tokenIdentifiers,
    profile,
  };
}
