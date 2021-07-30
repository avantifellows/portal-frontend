<template>
  <p>SELECT YOUR SCHOOL:</p>
  <select v-model="selectedSchool" @change="changeSchool(event)">
    <option disabled value="">Please select your school</option>
    <option v-for="school in this.schoolsList" :key="school.id" :value="school.name">
      {{ school.name }}
    </option>
  </select>

  <div v-if="this.selectedSchool != null">
    <p>Select student:</p>
    <p>
      <select multiple v-model="selectedStudent" @change="changeStudent">
        <option
          v-for="student in this.studentsList"
          :key="student.id"
          :value="student.name"
          @click="onClick"
        >
          {{ student.id }}-{{ student.name }}
        </option>
      </select>
    </p>

    <li v-for="student in this.selectedStudents" :key="student.name">
      <span>{{ student }}</span>
      <button @click="deleteFromList(index)">Delete</button>
    </li>
  </div>
</template>

<script>
import { listOfSchools } from "@/assets/list.js";
import { mapActions, mapState } from "vuex";

export default {
  name: "StudentSelect",
  data() {
    return {
      schoolsList: listOfSchools,
      studentsList: [],
      selectedSchool: null,
      selectedStudent: null,
      selectedStudents: [],
    };
  },
  computed: {
    ...mapState(["selectedSchool"]),
  },
  methods: {
    ...mapActions(["setSelectedSchool"]),
    ...mapActions(["setSelectedStudent"]),
    changeSchool() {
      this.setSelectedSchool(this.selectedSchool);
      this.studentsList = this.schoolsList.find(
        (item) => item.name === this.selectedSchool
      ).options;
    },
    changeStudent() {
      this.setSelectedStudent(this.selectedStudents);
    },
    onClick() {
      this.selectedStudents.push(this.selectedStudent);
    },
    deleteFromList(index) {
      this.selectedStudents.splice(index, 1);
    },
  },
};
</script>
