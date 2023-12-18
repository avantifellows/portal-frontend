import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

//encrypt and decrypt the localStorage
let localStorage = new SecureLS({ isCompression: true });

export default createStore({
  state: {
    groupData: {},
    language: "en",
  },
  actions: {
    setGroupData({ commit }, groupData) {
      commit("setGroupData", groupData);
    },
    setSessionData({ commit }, sessionData) {
      commit("setSessionData", sessionData);
    },
    setLanguage({ commit }, language) {
      commit("setLanguage", language);
    },
  },
  mutations: {
    setGroupData(state, groupData) {
      state.groupData = Object.assign({}, groupData);
    },
    setSessionData(state, sessionData) {
      state.sessionData = Object.assign({}, sessionData);
    },
    setLanguage(state, language) {
      state.language = language;
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
