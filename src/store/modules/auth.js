const state = {
    selectedSchool: null,
    selectedUserList: []
};
const getters={};
const actions={
    async setSelectedSchool({commit}, selectedSchool){
        await commit("setSelectedSchool", selectedSchool);
    },
    async setSelectedUsers({commit}, selectedUserList){
        await commit("setSelectedUsers", selectedUserList);
    }
};
const mutations = {
    setSelectedSchool(state, selectedSchool){
        state.selectedSchool = selectedSchool;
    },
    setSelectedStudents(state, selectedUserList){
        state.selectedUserList = selectedUserList;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
  };
  