import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import './index.css';
import InlineSvg from "vue-inline-svg";

const app = createApp(App).component('inline-svg', InlineSvg).use(store).use(router);


app.mount('#app');
