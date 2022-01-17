import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
//import SecureLS from "secure-ls";

// encrypt and decrypt the localStorage
//let localStorage = new SecureLS({ isCompression: false });

export default createStore({
  state: {
    phoneNumber: null,
  },
  getters: {
    getUserPhoneNumber: (state) => {
      return state.phoneNumber;
    },
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
  plugins: [createPersistedState()],
});
