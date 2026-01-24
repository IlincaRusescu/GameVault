import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = "http://localhost:5000";

export const useSessionsStore = defineStore("sessions", {
  state: () => ({
    sessionsItems: [],
    sessionsLoading: false,
    sessionsError: "",

    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
  }),

  actions: {
    _getToken() {
      const authStore = useAuthStore();
      return authStore?.token || "";
    },

    async fetchAllSessions() {
      this.sessionsLoading = true;
      this.sessionsError = "";

      try {
        const token = this._getToken();
        if (!token) {
          this.sessionsError = "Missing auth token. Please log in again.";
          this.sessionsItems = [];
          return;
        }

        const res = await fetch(`${API_BASE_URL}/sessions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.sessionsError = data?.message || `Failed to load sessions (${res.status}).`;
          this.sessionsItems = [];
          return;
        }

        this.sessionsItems = Array.isArray(data?.items) ? data.items : [];
      } catch (err) {
        console.error("Fetch all sessions failed:", err);
        this.sessionsError = err?.message || "Failed to load sessions.";
        this.sessionsItems = [];
      } finally {
        this.sessionsLoading = false;
      }
    },

    // keep createSession used by GamesView (still per game)
    async createSession(gameId, payload) {
      this.createLoading = true;
      this.sessionsError = "";

      try {
        const token = this._getToken();
        if (!token) {
          this.sessionsError = "Missing auth token. Please log in again.";
          return false;
        }

        const res = await fetch(`${API_BASE_URL}/library/${gameId}/sessions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload || {}),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.sessionsError = data?.message || `Failed to create session (${res.status}).`;
          return false;
        }

        // refresh sessions list view
        await this.fetchAllSessions();
        return true;
      } catch (err) {
        console.error("Create session failed:", err);
        this.sessionsError = err?.message || "Failed to create session.";
        return false;
      } finally {
        this.createLoading = false;
      }
    },

    async updateSession(gameId, sessionId, patch) {
      this.updateLoading = true;
      this.sessionsError = "";

      try {
        const token = this._getToken();
        if (!token) {
          this.sessionsError = "Missing auth token. Please log in again.";
          return false;
        }

        const res = await fetch(`${API_BASE_URL}/library/${gameId}/sessions/${sessionId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch || {}),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.sessionsError = data?.message || `Failed to update session (${res.status}).`;
          return false;
        }

        await this.fetchAllSessions();
        return true;
      } catch (err) {
        console.error("Update session failed:", err);
        this.sessionsError = err?.message || "Failed to update session.";
        return false;
      } finally {
        this.updateLoading = false;
      }
    },

    async deleteSession(gameId, sessionId) {
      this.deleteLoading = true;
      this.sessionsError = "";

      try {
        const token = this._getToken();
        if (!token) {
          this.sessionsError = "Missing auth token. Please log in again.";
          return false;
        }

        const res = await fetch(`${API_BASE_URL}/library/${gameId}/sessions/${sessionId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.sessionsError = data?.message || `Failed to delete session (${res.status}).`;
          return false;
        }

        await this.fetchAllSessions();
        return true;
      } catch (err) {
        console.error("Delete session failed:", err);
        this.sessionsError = err?.message || "Failed to delete session.";
        return false;
      } finally {
        this.deleteLoading = false;
      }
    },
  },
});
