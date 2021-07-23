import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/Homepage.vue";

const routes = [
    {
        path: "/",
        name:"HomePage",
        component: HomePage,
      //   props: (route) => ({
      //     purpose: route.query.purpose
      //     //redirectURL: route.query.
      // })
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    mode: 'history',
  });


export default router;
export {routes};