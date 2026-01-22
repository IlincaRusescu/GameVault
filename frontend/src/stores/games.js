import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = "http://localhost:5000";

export const useGamesStore = defineStore("games", {
  state: () => ({
    games: [],

    catalog: [],
    catalogLoading: false,
    catalogError: "",

    catalogCreateLoading: false,
    catalogCreateError: "",

    catalogUpdateLoading: false,
    catalogUpdateError: '',
  }),

  getters: {
    sortedCatalog(state) {
      return [...state.catalog].sort((a, b) =>
        (a.name ?? "").localeCompare((b.name ?? ""), undefined, {
          sensitivity: "base",
          numeric: true,
        })
      );
    },
  },

  actions: {
    getToken() {
      let token = "";

      // 1) token din auth store
      try {
        const auth = useAuthStore();
        token = auth?.token || "";
      } catch (e) {
        token = "";
      }

      // 2) Fallback: exact cheia din localStorage folosita de auth.js
      if (!token) {
        token = localStorage.getItem("gv_token") || "";
      }

      // IMPORTANT: curata whitespace/newlines ca sa nu rupa header-ul
      // si scoate "Bearer " daca a fost salvat asa din greseala
      token = String(token)
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^Bearer\s+/i, "");

      return token;
    },

    async fetchCatalog() {
      this.catalogLoading = true;
      this.catalogError = "";

      try {
        const token = this.getToken();

        const headers = {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/catalog`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (!res.ok) {
          let msg = "";
          try {
            msg = await res.text();
          } catch (e) {}
          throw new Error(msg || `Request failed with ${res.status}`);
        }

        const data = await res.json();

        // mapping defensiv
        if (Array.isArray(data)) {
          this.catalog = data;
        } else if (Array.isArray(data.items)) {
          this.catalog = data.items;
        } else if (Array.isArray(data.data)) {
          this.catalog = data.data;
        } else if (Array.isArray(data.games)) {
          this.catalog = data.games;
        } else {
          this.catalog = [];
        }
      } catch (e) {
        this.catalogError = e?.message || "Failed to load catalog.";
        this.catalog = [];
      } finally {
        this.catalogLoading = false;
      }
    },

    async createCatalogGame(payload){
      this.catalogCreateLoading = true;
      this.catalogCreateError ="";

      try{
        const token = this.getToken();
        const headers = {
          "Content-Type": "application/json",
        };

        if(token) { 
          headers.Authorization = `Bearer ${token}`;
        }

        console.log('CREATE: API_BASE_URL =', API_BASE_URL)
        console.log('CREATE: token present =', !!token)
        console.log('CREATE: payload =', payload)

        const res = await fetch(`${API_BASE_URL}/api/catalog`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        console.log('CREATE: status =', res.status)

        if(!res.ok) {
          let msg = "";
          try{
            msg = await res.text();
          }catch(e){}
          throw new Error(msg || `Request failed with ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch(e){
        this.catalogCreateError = e?.message || "Failed to create game.";
        throw e;
      }finally {
        this.catalogCreateLoading = false;
      }
    },

    async updateCatalogGame(id, payload) {
      this.catalogUpdateLoading = true
      this.catalogUpdateError = ''

      try {
        const token = this.getToken()
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(`${API_BASE_URL}/api/catalog/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          let msg = ''
          try {
            const err = await res.json()
            msg = err.message || ''
          } catch (e) {
            try {
              msg = await res.text()
            } catch (_) {}
          }
          throw new Error(msg || `Request failed with ${res.status}`)
        }

        return await res.json()
      } catch (e) {
        this.catalogUpdateError = e?.message || 'Failed to update game.'
        throw e
      } finally {
        this.catalogUpdateLoading = false
      }
    }
  },
});
