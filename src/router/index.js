import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    props: (route) => ({
      purpose: route.query.purpose,
      purposeParams: route.query.subPurpose,
      redirectTo: route.query.redirectTo,
      redirectID: route.query.redirectID,
      group: route.query.group,
      authType: route.query.authType,
      sessionId: route.query.sessionId,
    }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  mode: "history",
});

export default router;
export { routes };
