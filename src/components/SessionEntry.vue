<template>
<!-- User message -->
  <div v-if="!sessionActive">
    <UserMessage/>
  </div>
  <!-- Entry component -->
  <div v-else-if="sessionActive && groupData">
    <Entry
      :redirectTo="getRedirectTo"
      :redirectID="getRedirectId"
      :purpose="getPurpose"
      :purposeParams="getPurposeParams"
      :groupData="groupData"
      :group="getGroup"
      :authType="getAuthType"/>
  </div>
</template>

<script>
import UserMessage from "./UserMessage.vue";
import Entry from "./Entry.vue";
import groupAPIService from "../services/API/groupData";

export default {
  name: "SessionEntry",
  components:{UserMessage, Entry},
     props: {
    sessionData: Object,
    sessionEnabled: Boolean
     },
     data(){
       return {
          sessionActive : this.sessionEnabled, // local mutable variable
          groupData: null, //stores details about the group
          currentDateTime : new Date() // user's current date and time
       }
     },
     computed:{
       /** Combines session start date and start time */
       getSessionStartDateTime(){
         return (new Date(this.sessionData.startDate + " " + this.sessionData.startTime))
       },

       /** Parses datetime string into milliseconds */
       getSessionDateTimeInMilliseconds(datetime){
         return Date.parse(datetime)
       },

       /** Combines session end date and end time */
       getSessionEndDateTime(){
         return (new Date(this.sessionData.startDate + " " + this.sessionData.endTime))
       },

       /** Retrieves destination platform */
       getRedirectTo(){
         return this.sessionData.redirectPlatform
       },

       /** Retrieves destination ID */
       getRedirectId(){
         return this.sessionData.redirectPlatformParams.link
       },

       /** Retrieves group name */
       getGroup(){
         return this.sessionData.group
       },

       /** Returns authentication method based on user's choice. For now, only ID is supported. */
       getAuthType(){
         return "ID"
       },
       getPurpose(){
         return "attendance"
       },
       getPurposeParams(){
         if(this.sessionData.redirectPlatform == "plio"){
           return "plio"
         }
         else return "liveclass"
       },

       /** Checks if the session has begun */
        isStartDateTimeValid(){
          return this.getSessionDateTimeInMilliseconds(this.getSessionStartDateTime) <= Date.parse(this.currentDateTime)
        },

        /** Checks if the session has ended */
        isEndDateTimeValid(){
          return Date.parse(this.currentDateTime) <= this.getSessionDateTimeInMilliseconds(this.getSessionEndDateTime)
        },

        /** Checks if the session scheduled day matches the current day */
        isRepeatScheduleValid(){
          if(this.sessionData.repeatSchedule.type == "weekly"){
              return this.sessionData.repeatSchedule.params.includes(this.currentDateTime.getDay())
          }
          return false
        }
     },
     async created(){
       /** Sets the sessionActive variable based on the validity of the start time, end time and schedule */
       if(!(this.isStartDateTimeValid &&  this.isEndDateTimeValid && this.isRepeatScheduleValid))
         this.sessionActive = false;
      this.groupData = await groupAPIService.getGroupData(this.getGroup)

     }

};
</script>
