import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

//encrypt and decrypt the localStorage
let localStorage = new SecureLS({ isCompression: true });

export default createStore({
  state: {
    authGroupData: {},
    sessionData: {},
    locale: "en",
    id_generation: false,
    redirection: true,
    platform: "",
    platform_id: "",
    images: [],
  },
  actions: {
    setAuthGroupData({ commit }, authGroupData) {
      commit("setAuthGroupData", authGroupData);
    },
    setSessionData({ commit }, sessionData) {
      commit("setSessionData", sessionData);
    },
    setIdGeneration({ commit }, id_generation) {
      commit("setIdGeneration", id_generation);
    },
    setRedirection({ commit }, redirection) {
      commit("setRedirection", redirection);
    },
    setPlatform({ commit }, platform) {
      commit("setPlatform", platform);
    },
    setPlatformId({ commit }, platform_id) {
      commit("setPlatformId", platform_id);
    },
    setLocale({ commit }, locale) {
      commit("setLocale", locale);
    },
    setImages({ commit }, images) {
      commit("setImages", images);
    },
  },
  mutations: {
    setAuthGroupData(state, authGroupData) {
      state.authGroupData = Object.assign({}, authGroupData);
    },
    setSessionData(state, sessionData) {
      state.sessionData = Object.assign({}, sessionData);
    },
    setIdGeneration(state, id_generation) {
      state.id_generation = id_generation;
    },
    setRedirection(state, redirection) {
      state.redirection = redirection;
    },
    setPlatform(state, platform) {
      state.platform = platform;
    },
    setPlatformId(state, platform_id) {
      state.platform_id = platform_id;
    },
    setLocale(state, locale) {
      state.locale = locale;
    },
    setImages(state, images) {
      state.images = images;
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
