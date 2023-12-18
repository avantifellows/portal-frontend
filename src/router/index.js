import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Sentry from "@/pages/Sentry.vue";
import Error from "@/pages/Error.vue";
import Signup from "@/components/Signup.vue";
import NewSignup from "@/pages/NewSignup.vue";
import NewSignin from "@/pages/NewSignin.vue";
import InformationForm from "@/pages/InformationForm.vue";
import AIETReporting from "@/components/AIETReporting.vue";
import AIETProfileForm from "@/components/AIETProfileForm.vue";

// legacy URLs support redirectID, new URLs must use redirectId
const allowedQueryParams = [
  "sessionId",
  "purpose",
  "subPurpose",
  "redirectTo",
  "redirectID",
  "group",
  "redirectId",
  "authType",
  "session_type",
  "auth_type",
  "enable_signup",
  "enable_pop_up_form",
  "id_generation",
  "redirection",
  "platform",
  "platform_id",
];

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    props: (route) => ({
      purpose: route.query.purpose,
      purposeParams: route.query.subPurpose,
      redirectTo: route.query.redirectTo,
      // legacy URLs support redirectID, new URLs must use redirectId
      redirectId: route.query.redirectID || route.query.redirectId,
      group: route.query.group,
      sessionId: route.query.sessionId,
      type: route.query.type || route.query.purpose,
      sub_type: route.query.sub_type || route.query.subPurpose,
      auth_type: route.query.auth_type,
      enable_signup: route.query.enable_signup,
      enable_pop_up_form: route.query.enable_pop_up_form,
      id_generation: route.query.id_generation,
      redirection: route.query.redirection,
      platform: route.query.platform || route.query.redirectTo,
      platform_id: route.query.platform_id || route.query.redirectId,
    }),
  },
  {
    path: "/sign-up",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/new-sign-up",
    name: "NewSignup",
    component: NewSignup,
  },
  {
    path: "/sign-in",
    name: "NewSignin",
    component: NewSignin,
  },
  {
    path: "/form/:id",
    name: "Information Form",
    props: true,
    component: InformationForm,
  },
  {
    path: "/404-not-found",
    name: "Error",
    props: true,
    component: Error,
  },
  {
    path: "/aiet-reporting/:redirectId/:id/:dateOfBirth",
    name: "AIETReporting",
    component: AIETReporting,
  },
  {
    path: "/aiet-profile-form",
    name: "AIETProfileForm",
    component: AIETProfileForm,
  },
  {
    path: "/sentry",
    name: "Sentry",
    component: Sentry,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  mode: "history",
});

/** Check if correct query params exist */
router.beforeEach((to) => {
  const queryParams = Object.keys(to.query);
  const validQueryParams = queryParams.every((queryParam) =>
    allowedQueryParams.includes(queryParam)
  );

  if (!validQueryParams) {
    return {
      name: "Error",
    };
  }
});

export default router;
