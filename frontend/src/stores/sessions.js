import { defineStore } from "pinia";

export const useSessionsStore = defineStore("sessions", {
  state: () => ({
    sessions: []
  })
});
