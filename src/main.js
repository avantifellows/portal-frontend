import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import InlineSvg from "vue-inline-svg";
import store from "./store";
const app = createApp(App)
  .component("inline-svg", InlineSvg)
  .use(router)
  .use(store);

app.mount("#app");
