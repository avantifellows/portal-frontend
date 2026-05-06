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
    const hydratedProfile = await UserAPI.getProfileForToken(
      userType,
      identifiers
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
