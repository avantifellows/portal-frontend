import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

//encrypt and decrypt the localStorage
let localStorage = new SecureLS({ isCompression: true });

export default createStore({
  state: {
    phoneNumber: null,
    groupData: {},
    sessionData: {},
    language: "en",
  },
  actions: {
    setPhoneNumber({ commit }, phoneNumber) {
      commit("setPhoneNumber", phoneNumber);
    },
    setGroupData({ commit }, groupData) {
      commit("setGroupData", groupData);
    },
    setSessionData({ commit }, sessionData) {
      commit("setSessionData", sessionData);
    },
    setSessionId({ commit }, sessionId) {
      commit("setSessionId", sessionId);
    },
    setLanguage({ commit }, language) {
      commit("setLanguage", language);
    },
  },
  mutations: {
    setPhoneNumber(state, phoneNumber) {
      state.phoneNumber = phoneNumber;
    },
    setGroupData(state, groupData) {
      state.groupData = Object.assign({}, groupData);
    },
    setSessionData(state, sessionData) {
      state.sessionData = Object.assign({}, sessionData);
    },
    setSessionId(state, sessionId) {
      state.sessionData.sessionId = sessionId;
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
