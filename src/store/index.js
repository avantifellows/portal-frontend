import { createStore } from "vuex";
import auth from "./modules/auth";

export default createStore({
    plugins: [
    ],
    modules: {
        auth
      },
});
