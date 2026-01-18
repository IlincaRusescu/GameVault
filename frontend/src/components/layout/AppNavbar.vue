<template>
  <v-app-bar app fixed flat :height="75" class="app-navbar">
    <div class="left">
      <v-btn icon variant="text" class="icon-btn" @click="toggleDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <div class="brand">
        <v-img
          :src="logoIcon"
          alt="GameVault Icon"
          width="42"
          height="42"
          class="brand-icon"
          contain
        />

        <v-img :src="logoName" alt="GameVault" width="150" height="32" class="brand-name" contain />
      </div>
    </div>

    <div class="center" v-if="!isMobile">
      <span class="tagline">
        Your <span class="accent">games</span>. Your sessions. Your
        <span class="accent">vault</span>.
      </span>
    </div>

    <div class="right">
      <span class="hi">
        Hi, <span class="user">{{ displayName }}</span>
      </span>

      <v-btn icon class="logout-icon" @click="handleLogout" :title="'Logout'">
        <v-icon icon="mdi-logout" />
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import logoIcon from '@/assets/logo_img.png'
import logoName from '@/assets/logo_name.png'

const props = defineProps({
  drawer: { type: Boolean, required: true },
  isMobile: { type: Boolean, required: true },
})
const emit = defineEmits(['update:drawer'])

const router = useRouter()
const auth = useAuthStore()

const displayName = computed(() => {
  if (!auth.user) return 'User'
  return auth.user.username || auth.user.firstName || auth.user.email || 'User'
})

function toggleDrawer() {
  emit('update:drawer', !props.drawer)
}

function handleLogout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.app-navbar {
  background: #222222;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 12px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 320px;
}

.icon-btn {
  color: #ffffff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.brand-name {
  margin-top: 2px;
}

.center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.tagline {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.2px;
}

.accent {
  color: #fe9100;
  font-weight: 700;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  justify-content: flex-end;
}

.hi {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
}

.user {
  font-weight: 700;
}

.logout-icon {
  background: #fe9100;
  color: #1a1a1a;
  border-radius: 999px;
  width: 44px;
  height: 44px;
}

.logout-icon:hover {
  filter: brightness(0.95);
}
</style>
