// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// layout
import AppLayout from "@/components/layout/AppLayout.vue";

// public views
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";

// protected views
import DashboardView from "@/views/DashboardView.vue";
import GamesView from "@/views/GamesView.vue";
import SessionsView from "@/views/SessionsView.vue";
import CatalogView from "@/views/CatalogView.vue";
import HistoryView from "@/views/HistoryView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* =======================
       PUBLIC ROUTES
    ======================== */
    { path: "/login", name: "login", component: LoginView, meta: { public: true } },
    { path: "/register", name: "register", component: RegisterView, meta: { public: true } },
    {
      path: "/forgot-password",
      name: "forgotPassword",
      component: ForgotPasswordView,
      meta: { public: true },
    },
    {
      path: "/reset-password",
      name: "resetPassword",
      component: ResetPasswordView,
      meta: { public: true },
    },

    /* =======================
       PROTECTED ROUTES (with layout)
    ======================== */
    {
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "", redirect: "/dashboard" },

        { path: "dashboard", name: "dashboard", component: DashboardView },
        { path: "games", name: "games", component: GamesView },
        { path: "sessions", name: "sessions", component: SessionsView },
        { path: "catalog", name: "catalog", component: CatalogView },
        { path: "history", name: "history", component: HistoryView },
      ],
    },

    // fallback
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

// ✅ guard: dacă nu ai token -> login
router.beforeEach((to) => {
  const auth = useAuthStore();

  // dacă user e logat și încearcă să intre pe login/register, îl ducem în dashboard
  if (
    to.meta.public &&
    auth.isAuthenticated &&
    (to.path === "/login" || to.path === "/register")
  ) {
    return "/dashboard";
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return "/login";
  }
});

export default router;
