import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// existing views
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";

import GamesView from "@/views/GamesView.vue";
import SessionsView from "@/views/SessionsView.vue";
import CatalogView from "@/views/CatalogView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // public
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/register", component: RegisterView, meta: { public: true } },
    { path: "/forgot-password", component: ForgotPasswordView, meta: { public: true } },
    { path: "/reset-password", component: ResetPasswordView, meta: { public: true } },

    // protected
    { path: "/", redirect: "/games" },
    { path: "/games", component: GamesView, meta: { requiresAuth: true } },
    { path: "/sessions", component: SessionsView, meta: { requiresAuth: true } },
    { path: "/catalog", component: CatalogView, meta: { requiresAuth: true } },
  ],
});

// ✅ guard: dacă nu ai token -> login
router.beforeEach((to) => {
  const auth = useAuthStore();

  // dacă user e logat și încearcă să intre pe login/register, îl ducem în app
  if (to.meta.public && auth.isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    return "/games";
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return "/login";
  }
});

export default router;
