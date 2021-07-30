import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/Homepage.vue";

const routes = [
    {
        path: "/",
        name:"Homepage",
        component: HomePage,
        props: (route) => ({
          purpose: route.query.purpose,
          subPurpose: route.query.subPurpose,
          redirectTo: route.query.redirectTo,
          redirectID: route.query.redirectID
       })
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    mode: 'history',
  });


export default router;
export {routes};