<template>
  <div v-if="isLoading">
    <div class="flex m-auto w-full h-full">
      <inline-svg
        class="text-black text-4xl m-auto animate-spin h-20 w-20"
        :src="loadingSpinnerSvg"
      />
    </div>
  </div>

  <!-- User message -->
  <div v-if="!sessionActive">
    <NoClassMessage />
  </div>
  <!-- Entry component -->
  <div v-else-if="sessionActive && groupData">
    <Entry
      :redirectTo="redirectTo"
      :redirectID="redirectId"
      :purpose="purpose"
      :purposeParams="purposeParams"
      :groupData="groupData"
      :group="group"
      :authType="authType"
      :sessionId="sessionId"
    />
  </div>
</template>

<script>
import NoClassMessage from "./NoClassMessage.vue";
import Entry from "./Entry.vue";
import groupAPIService from "@/services/API/groupData";
import useAssets from "@/assets/assets.js";

const assets = useAssets();
const EXTRA_5_MINUTES = 900000;
export default {
  name: "SessionEntry",
  components: {
    NoClassMessage,
    Entry,
  },
  props: {
    sessionData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      sessionActive: true, // whether the timings between the session and user match
      groupData: null, //stores details about the group
      currentDateTime: new Date(), // user's current date and time
      isLoading: false,
      loadingSpinnerSvg: assets.loadingSpinnerSvg,
    };
  },
  computed: {
    /** Returns formatted local date of the user  */
    currentDate() {
      let year = this.currentDateTime.getFullYear().toString();
      let month =
        (this.currentDateTime.getMonth() + 1 < 9 ? "0" : "") +
        (this.currentDateTime.getMonth() + 1).toString();
      let date =
        (this.currentDateTime.getDate() + 1 < 9 ? "0" : "") +
        this.currentDateTime.getDate().toString();
      return year + "-" + month + "-" + date;
    },

    /** Checks if current date is greater than start date and combines current date and start time */
    sessionStartDateTime() {
      return (
        this.sessionData.startDate <= this.currentDate &&
        new Date(this.currentDate + " " + this.sessionData.startTime)
      );
    },

    /** Checks if current date is less than end date and combines current date and end time */
    sessionEndDateTime() {
      if ("endDate" in this.sessionData) {
        return (
          this.sessionData.endDate >= this.currentDate &&
          new Date(this.sessionData.endDate + " " + this.sessionData.endTime)
        );
      }
      return new Date(this.currentDate + " " + this.sessionData.endTime);
    },

    /** Retrieves destination platform */
    redirectTo() {
      return this.sessionData.redirectPlatform;
    },

    /** Retrieves destination ID */
    redirectId() {
      return this.sessionData.redirectPlatformParams.id;
    },

    /** Retrieves group name */
    group() {
      return this.sessionData.group;
    },

    /** Returns authentication method based on user's choice. For now, only ID is supported. */
    authType() {
      return "ID";
    },

    /** Returns the purpose value stored in session data */
    purpose() {
      return this.sessionData.purpose;
    },

    /** Returns the purpose params stored in session data */
    purposeParams() {
      return this.sessionData.purposeParams;
    },

    /** Checks if the session has begun */
    isStartDateTimeValid() {
      return (
        this.getSessionDateTimeInMilliseconds(this.sessionStartDateTime) <=
        Date.parse(this.currentDateTime) + EXTRA_5_MINUTES
      );
    },

    /** Checks if the session has ended */
    isEndDateTimeValid() {
      return (
        Date.parse(this.currentDateTime) <=
        this.getSessionDateTimeInMilliseconds(this.sessionEndDateTime)
      );
    },

    /** Checks if the session scheduled day matches the current day */
    isRepeatScheduleValid() {
      if ("repeatSchedule" in this.sessionData) {
        if (this.sessionData.repeatSchedule.type == "weekly") {
          return this.sessionData.repeatSchedule.params.includes(
            this.currentDateTime.getDay()
          );
        }
        return false;
      }
      return true;
    },

    /** Retrieves session ID */
    sessionId() {
      return this.sessionData.id;
    },
  },
  async created() {
    /** Sets the sessionActive variable based on the validity of the start time, end time and schedule */
    if (
      !(
        this.isStartDateTimeValid &&
        this.isEndDateTimeValid &&
        this.isRepeatScheduleValid
      )
    )
      this.sessionActive = false;
    this.isLoading = true;
    this.groupData = await groupAPIService.getGroupData(this.group);
    this.isLoading = false;
  },
  methods: {
    /** Parses datetime string into milliseconds */
    getSessionDateTimeInMilliseconds(datetime) {
      return Date.parse(JSON.parse(JSON.stringify(datetime)));
    },
  },
};
</script>
