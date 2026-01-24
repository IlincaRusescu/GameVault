import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = "http://localhost:5000";

export const useLibraryStore = defineStore("library", {
  state: () => ({
    libraryItems: [],
    libraryLoading: false,
    libraryError: "",
  }),

  getters: {
    libraryIdsSet: (state) =>
      new Set((state.libraryItems || []).map((g) => String(g.id))),
    libraryCount: (state) => (state.libraryItems || []).length,
  },

  actions: {
    _getToken() {
      const authStore = useAuthStore();

      return authStore?.token || "";
    },

    async fetchLibrary() {
      this.libraryLoading = true;
      this.libraryError = "";

      try {
        const token = this._getToken();

        if (!token) {
          this.libraryError = "Missing auth token. Please log in again.";
          this.libraryItems = [];
          return;
        }

        const res = await fetch(`${API_BASE_URL}/library`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.libraryError = data?.message || `Failed to load library (${res.status}).`;
          this.libraryItems = [];
          return;
        }

        this.libraryItems = Array.isArray(data?.items) ? data.items : [];
      } catch (err) {
        console.error("Fetch library failed:", err);
        this.libraryError = err?.message || "Failed to load library.";
        this.libraryItems = [];
      } finally {
        this.libraryLoading = false;
      }
    },

    async addToLibrary(gameId) {
      this.libraryError = "";

      try {
        const token = this._getToken();

        if (!token) {
          this.libraryError = "Missing auth token. Please log in again.";
          return false;
        }

        const res = await fetch(`${API_BASE_URL}/library/${gameId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          this.libraryError = data?.message || `Failed to add game (${res.status}).`;
          return false;
        }

        await this.fetchLibrary();
        return true;
      } catch (err) {
        console.error("Add to library failed:", err);
        this.libraryError = err?.message || "Failed to add game to library.";
        return false;
      }
    },

    isInLibrary(gameId) {
      return this.libraryIdsSet.has(String(gameId));
    },

    async removeFromLibrary(gameId) {
    this.libraryError = "";

    try {
      const token = this._getToken();

      if (!token) {
        this.libraryError = "Missing auth token. Please log in again.";
        return false;
      }

      const res = await fetch(`${API_BASE_URL}/library/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        this.libraryError = data?.message || `Failed to remove game (${res.status}).`;
        return false;
      }

      await this.fetchLibrary();
      return true;
    } catch (err) {
      console.error("Remove from library failed:", err);
      this.libraryError = err?.message || "Failed to remove game from library.";
      return false;
    }
    },

},
});
