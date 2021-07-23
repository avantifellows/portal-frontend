import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";

var localStorage = new SecureLS({ isCompression: false });

export default createStore({
    state :{
        selectedSchool: null,
        selectedStudents: []
    },
    getters: {},
    actions: {
        async setSelectedSchool({commit}, selectedSchool){
            await commit("setSelectedSchool", selectedSchool);
        },
        async setSelectedStudents({commit}, selectedStudents){
            await commit("setSelectedSchools", selectedStudents);
        }

    },
    mutations:{
        setSelectedSchool(state, selectedSchool){
            
            state.selectedSchool = selectedSchool;
        },
        setSelectedStudents(state, selectedStudents){
            state.selectedStudents = selectedStudents;
        }
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