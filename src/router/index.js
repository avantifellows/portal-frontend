import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Error from "@/pages/Error.vue";
import Signup from "@/pages/Signup.vue";
import Signin from "@/pages/Signin.vue";
import InformationForm from "@/pages/InformationForm.vue";

const allowedQueryParams = [
  "sessionId",
  "authGroup",
  "auth_type",
  "signup_form",
  "popup_form",
  "id_generation",
  "redirection",
  "platform",
  "platform_id",
  "signup_form_id",
  "popup_form_id",
  "type",
  "omrMode",
  "abTestId",
  "testType",
  "platform_link",
];

// Legacy parameters for backwards compatibility with existing shortened links
// TODO: Will be deprecated once all old links are updated
const LEGACY_ALLOWED_PARAMS = [
  "redirectTo", // maps to platform
  "redirectId", // maps to platform_id
  "group", // maps to authGroup
  "sub_type", // ignored (deprecated)
];

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    props: (route) => ({
      authGroup: route.query.authGroup,
      sessionId: route.query.sessionId,
      omrMode: route.query.omrMode,
      abTestId: route.query.abTestId,
      type: route.query.type,
      auth_type: route.query.auth_type,
      signup_form: route.query.signup_form,
      popup_form: route.query.popup_form,
      id_generation: route.query.id_generation,
      redirection: route.query.redirection,
      platform: route.query.platform,
      platform_id: route.query.platform_id,
      platform_link: route.query.platform_link,
      signup_form_id: route.query.signup_form_id,
      popup_form_id: route.query.popup_form_id,
      testType: route.query.testType,
    }),
  },
  {
    path: "/signup",
    name: "SignUp",
    component: Signup,
    props: (route) => ({
      sessionId: route.query.sessionId,
      type: route.query.type,
    }),
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/form/:id",
    name: "Information Form",
    props: (route) => ({
      id: route.params.id,
      sessionId: route.query.sessionId,
    }),
    component: InformationForm,
  },
  {
    path: "/404-not-found",
    name: "Error",
    props: true,
    component: Error,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: Error,
    props: {
      type: "404",
      text: "Page not found. Please check the URL and try again.",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  mode: "history",
});

/** Check if correct query params exist and map legacy parameters */
router.beforeEach((to) => {
  const queryParams = Object.keys(to.query);
  const allAllowedParams = [...allowedQueryParams, ...LEGACY_ALLOWED_PARAMS];
  const validQueryParams = queryParams.every((queryParam) =>
    allAllowedParams.includes(queryParam)
  );

  if (!validQueryParams) {
    return {
      name: "Error",
    };
  }

  // Map legacy parameters for backwards compatibility
  const legacyMappings = {
    redirectTo: "platform",
    redirectId: "platform_id",
    group: "authGroup",
  };

  let hasLegacyParams = false;
  Object.entries(legacyMappings).forEach(([legacyParam, currentParam]) => {
    if (to.query[legacyParam]) {
      to.query[currentParam] = to.query[legacyParam];
      delete to.query[legacyParam];
      hasLegacyParams = true;
    }
  });

  // Remove deprecated parameters
  if (to.query.sub_type) {
    delete to.query.sub_type;
    hasLegacyParams = true;
  }

  // If we modified the query, redirect to clean URL
  if (hasLegacyParams) {
    return {
      path: to.path,
      query: to.query,
      replace: true,
    };
  }

  // Prevent direct access to /signup without proper authentication context
  if (to.name === "SignUp") {
    // Check if accessing signup directly without sessionId or proper type parameter
    if (!to.query.sessionId && to.query.type !== "signup") {
      return {
        name: "Error",
        props: {
          text: "Please start from the beginning by accessing the proper sign-in link. Direct access to signup is not allowed.",
        },
      };
    }
  }

  // Prevent direct access to /form/:id without proper context
  if (to.name === "Information Form") {
    // Check if accessing form directly without sessionId parameter
    if (!to.query.sessionId) {
      return {
        name: "Error",
        props: {
          text: "Session expired or invalid access. Please start from the beginning by accessing your sign-in link again.",
        },
      };
    }
  }
});

export default router;
