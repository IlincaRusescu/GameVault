import { defineStore } from "pinia";

export const useGamesStore = defineStore("games", {
  state: () => ({
    games: []
  })
});
