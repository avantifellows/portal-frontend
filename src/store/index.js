import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
import auth from "./modules/auth";

var localStorage = new SecureLS({ isCompression: false });

export default createStore({
    plugins: [
        createPersistedState({
        storage: {
            getItem: (key) => {
            try {
                return localStorage.get(key);
            } catch (error) {
                console.log(error);
            }
            },
            setItem: (key, value) => localStorage.set(key, value),
            removeItem: (key) => localStorage.remove(key),
        },
        }),
    ],
    modules: {
        auth
      },
});