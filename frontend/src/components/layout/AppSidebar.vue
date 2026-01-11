<template>
  <v-navigation-drawer
    v-model="drawerProxy"
    :temporary="isMobile"
    :permanent="!isMobile"
    class="app-drawer"
    width="280"
  >
    <div class="drawer-inner">
      <!-- TOP MENU -->
      <v-list density="comfortable" nav class="menu">
        <v-list-item
          title="Dashboard"
          prepend-icon="mdi-view-dashboard"
          :to="{ name: 'dashboard' }"
        />

        <v-list-item title="Game Catalog" prepend-icon="mdi-view-grid" :to="{ name: 'catalog' }" />

        <v-list-item title="My Games" prepend-icon="mdi-dice-multiple" :to="{ name: 'games' }" />

        <v-list-item
          title="My Sessions"
          prepend-icon="mdi-account-group"
          :to="{ name: 'sessions' }"
        />

        <v-list-item title="History" prepend-icon="mdi-history" :to="{ name: 'history' }" />
      </v-list>

      <!-- FOOTER (BOTTOM) -->
      <div class="footer-box">
        <div class="footer-accent"></div>

        <div class="footer-content">
          <p class="footer-title">GameVault</p>
          <p class="footer-sub">Your vault, always ready.</p>

          <!-- mici “stats” placeholders -->
          <div class="mini">
            <div class="mini-item">
              <span class="mini-label">Games</span>
              <span class="mini-value">—</span>
            </div>
            <div class="mini-item">
              <span class="mini-label">Sessions</span>
              <span class="mini-value">—</span>
            </div>
          </div>

          <p class="footer-hint">v0.1 • Beta</p>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  drawer: { type: Boolean, required: true },
  isMobile: { type: Boolean, required: true },
})
const emit = defineEmits(['update:drawer'])

const drawerProxy = computed({
  get: () => props.drawer,
  set: (v) => emit('update:drawer', v),
})
</script>

<style scoped>
.app-drawer {
  background: #1a1a1a;
  color: #ffffff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu {
  padding-top: 8px;
}

/* FOOTER */
.footer-box {
  margin-top: auto;
  padding: 14px 14px 16px;
}

.footer-accent {
  height: 2px;
  width: 70px;
  background: #fe9100;
  border-radius: 999px;
  margin-bottom: 10px;
}

.footer-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
}

.footer-title {
  margin: 0;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.footer-sub {
  margin: 4px 0 10px;
  font-size: 12px;
  opacity: 0.7;
}

.mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.mini-item {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px;
}

.mini-label {
  display: block;
  font-size: 11px;
  opacity: 0.65;
}

.mini-value {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #fe9100;
  margin-top: 2px;
}

.footer-hint {
  margin: 0;
  font-size: 11px;
  opacity: 0.55;
}
</style>
