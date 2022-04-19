<template>
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

export default {
  name: "SessionEntry",
  components:{
    NoClassMessage,
    Entry
  },
  props: {
    sessionData: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data(){
    return {
      sessionActive : true, // whether the timings between the session and user match
      groupData: null, //stores details about the group
      currentDateTime : new Date() // user's current date and time
    }
  },
  computed:{
    /** Combines session start date and start time */
    sessionStartDateTime(){
      return (new Date(this.sessionData.startDate + " " + this.sessionData.startTime))
    },

    /** Combines session end date and end time */
    sessionEndDateTime(){
      return (new Date(this.sessionData.endDate + " " + this.sessionData.endTime))
    },

    /** Retrieves destination platform */
    redirectTo(){
      return this.sessionData.redirectPlatform
    },

    /** Retrieves destination ID */
    redirectId(){
      return this.sessionData.redirectPlatformParams.id
    },

    /** Retrieves group name */
    group(){
      return this.sessionData.group
    },

    /** Returns authentication method based on user's choice. For now, only ID is supported. */
    authType(){
      return "ID"
    },

    /** Returns the purpose value stored in session data */
    purpose(){
      return this.sessionData.purpose
    },

    /** Returns the purpose params stored in session data */
    purposeParams(){
      return this.sessionData.purposeParams
    },

    /** Checks if the session has begun */
    isStartDateTimeValid(){
      return this.getSessionDateTimeInMilliseconds(this.sessionStartDateTime) <= Date.parse(this.currentDateTime)
    },

    /** Checks if the session has ended */
    isEndDateTimeValid(){
      console.log(Date.parse(this.currentDateTime), this.getSessionDateTimeInMilliseconds(this.sessionEndDateTime))
      return Date.parse(this.currentDateTime) <= this.getSessionDateTimeInMilliseconds(this.sessionEndDateTime)
    },

    /** Checks if the session scheduled day matches the current day */
    isRepeatScheduleValid(){
      if(this.sessionData.repeatSchedule.type == "weekly"){
          return this.sessionData.repeatSchedule.params.includes(this.currentDateTime.getDay())
      }
      return false
    },

    /** Retrieves session ID */
    sessionId(){
      return this.sessionData.id
    }
  },
  async created(){
    /** Sets the sessionActive variable based on the validity of the start time, end time and schedule */
    if(!(this.isStartDateTimeValid &&  this.isEndDateTimeValid && this.isRepeatScheduleValid))
      this.sessionActive = false;
    this.groupData = await groupAPIService.getGroupData(this.group)
  },
  methods: {
    /** Parses datetime string into milliseconds */
    getSessionDateTimeInMilliseconds(datetime){
      return Date.parse(JSON.parse(JSON.stringify(datetime)))
    },
  }
};
</script>
