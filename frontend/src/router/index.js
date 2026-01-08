import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import GamesView from "@/views/GamesView.vue";
import SessionsView from "@/views/SessionsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/games" },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    { path: "/games", component: GamesView },
    { path: "/sessions", component: SessionsView }
  ]
});

export default router;
