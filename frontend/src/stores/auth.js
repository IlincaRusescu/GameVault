import { defineStore } from "pinia";
import * as authApi from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("gv_token") || "",
    user: JSON.parse(localStorage.getItem("gv_user") || "null"),
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    async login(email, password) {
      const data = await authApi.login({ email, password });
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("gv_token", this.token);
      localStorage.setItem("gv_user", JSON.stringify(this.user));
      return data;
    },

    async register(payload) {
      const data = await authApi.register(payload);
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("gv_token", this.token);
      localStorage.setItem("gv_user", JSON.stringify(this.user));
      return data;
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("gv_token");
      localStorage.removeItem("gv_user");
    },
  },
});
