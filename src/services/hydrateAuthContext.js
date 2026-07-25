import UserAPI from "@/services/API/user.js";
import { buildAuthContext } from "@/services/authContext";

export async function buildHydratedAuthContext({
  userInformation = {},
  identifiers = {},
  group = null,
  userType = null,
  platform = null,
} = {}) {
  let mergedUserInformation = userInformation;

  if (platform === "gurukul") {
    // `group` is the auth group name; pass it through so a student_id that exists in
    // more than one auth group hydrates the profile for the group being signed into.
    const hydratedProfile = await UserAPI.getProfileForToken(
      userType,
      identifiers,
      group
    );

    if (hydratedProfile) {
      mergedUserInformation = {
        ...userInformation,
        ...hydratedProfile,
      };
    }
  }

  return buildAuthContext({
    userInformation: mergedUserInformation,
    identifiers,
    group,
    userType,
  });
}
