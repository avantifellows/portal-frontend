import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

//encrypt and decrypt the localStorage
let localStorage = new SecureLS({ isCompression: true });

export default createStore({
  state: {
    phoneNumber: null,
  },
  actions: {
    setPhoneNumber({ commit }, phoneNumber) {
      commit("setPhoneNumber", phoneNumber);
    },
  },
  mutations: {
    setPhoneNumber(state, phoneNumber) {
      state.phoneNumber = phoneNumber;
    },
  },
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
});
