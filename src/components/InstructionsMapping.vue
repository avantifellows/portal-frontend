<template>
  <template v-if="isStudent">
    <p class="font-bold underline">
      PLEASE READ THE FOLLOWING INSTRUCTIONS CAREFULLY
    </p>
    <ul class="list-decimal p-3">
      <li>Please fill the form correctly and submit to access the test.</li>
      <li>
        Please select your course and grade correctly to access the right test.
      </li>
      <li>
        Test Details:
        <template v-if="isPurposeRegistration">
          <ul class="list-disc">
            <li>Class 11 JEE: 120 minutes, 30 questions (120 marks)</li>
            <li>Class 12 JEE: 180 minutes, 75 questions (300 marks)</li>
            <li>Class 11 NEET: 120 minutes, 30 questions (120 marks)</li>
            <li>Class 12 NEET: 180 minutes, 180 questions (720 marks)</li>
          </ul>
        </template>
        <template v-else>
          <ul class="list-disc">
            <li>Maths : 35 Questions (max marks possible : 140)</li>
            <li>Science: 35 Questions (max marks possible : 140)</li>
            <li>Aptitude: 30 Questions (max marks possible : 120)</li>
          </ul>
        </template>
      </li>
      <li>
        Scoring Pattern -- Correct Answer: +4, Wrong Answer: -1, Skipped: 0
      </li>
      <li class="text-red-600">
        During the test, to confirm your answer please click
        <b>SAVE & NEXT</b>. Your response to a question will not be considered
        incase you fail to save your answer.
      </li>
      <li>
        Only press <b>END TEST</b> once you have completed and reviewed your
        answers. You will not be able to change your responses once you click on
        <b>END TEST</b>
      </li>
    </ul>
  </template>
  <template v-else>
    <p class="font-bold underline">
      PLEASE READ THE FOLLOWING INSTRUCTIONS CAREFULLY
    </p>
    <ul class="list-decimal p-3">
      <li>
        The number of questions and the test duration will appear on your screen
        before starting the test.
      </li>
      <li>Each question has four options, out of which only one is correct.</li>
      <li>
        Each question carries 2 marks. 1 mark will be deducted for each wrong
        answer.
      </li>
    </ul>
  </template>
</template>

<script>
export default {
  name: "InstructionsMapping",
  props: {
    isStudent: {
      type: Boolean,
      default: true,
    },
    isPurposeRegistration: {
      type: Boolean,
    },
  },
};
</script>
