<template>
  <div v-if="!sessionActive">
    <UserMessage/>
  </div>
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
          sessionActive : this.sessionEnabled,
          groupData: null,
          currentDateTime : new Date()
       }
     },
     computed:{
       getSessionStartDateTime(){
         return (new Date(this.sessionData.startDate + " " + this.sessionData.startTime))
       },
       getSessionStartDateTimeInMilliseconds(){
         return Date.parse(this.getSessionStartDateTime)
       },
       getSessionEndDateTime(){
         return (new Date(this.sessionData.startDate + " " + this.sessionData.endTime))
       },
       getSessionEndDateTimeInMilliseconds(){
         return Date.parse(this.getSessionEndDateTime)
       },
       getRedirectTo(){
         return this.sessionData.redirectPlatform
       },
       getRedirectId(){
         return this.sessionData.redirectPlatformParams.link
       },
       getGroup(){
         return this.sessionData.group
       },
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
        isStartDateTimeValid(){
          return this.getSessionStartDateTimeInMilliseconds <= Date.parse(this.currentDateTime)
        },
        isEndDateTimeValid(){
          return Date.parse(this.currentDateTime) <= this.getSessionEndDateTimeInMilliseconds
        },
        isRepeatScheduleValid(){
          if(this.sessionData.repeatSchedule.type == "weekly"){
              return this.sessionData.repeatSchedule.params.includes(this.currentDateTime.getDay())
          }
          return false
        }
     },
     async created(){
       if(!(this.isStartDateTimeValid &&  this.isEndDateTimeValid && this.isRepeatScheduleValid))
         this.sessionActive = false;
      this.groupData = await groupAPIService.getGroupData(this.getGroup)

     }

};
</script>
