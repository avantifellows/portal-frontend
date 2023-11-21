import { createApp } from "vue";
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";
import InlineSvg from "vue-inline-svg";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./index.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { plugin, defaultConfig } from "@formkit/vue";
import { createLocalStoragePlugin } from "@formkit/addons";

const config = defaultConfig({
  plugins: [
    createLocalStoragePlugin({
      // plugin defaults:
      prefix: "formkit",
      key: undefined,
      control: undefined,
      maxAge: 3600000, // 1 hour
      debounce: 200,
      beforeSave: undefined,
      beforeLoad: undefined,
    }),
  ],
});

const app = createApp(App)
  .component("inline-svg", InlineSvg)
  .use(router)
  .use(store)
  .use(Toast)
  .use(plugin, config);

if (["staging", "production"].includes(import.meta.env.MODE)) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_APP_SENTRY_DSN,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    logErrors: true,
    environment: import.meta.env.MODE,
  });
}

app.mount("#app");
