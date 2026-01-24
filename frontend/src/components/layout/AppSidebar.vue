<template>
  <v-navigation-drawer
    app
    v-model="drawerProxy"
    :temporary="isMobile"
    :permanent="!isMobile"
    class="app-drawer"
    width="280"
  >
    <div class="drawer-inner">
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
      </v-list>

      <!-- SIMPLE FOOTER -->
      <div class="footer-box">
        <div class="footer-content">
          <p class="footer-title">GameVault</p>

          <p class="footer-text">© 2026 GameVault</p>

          <p class="footer-text">📞 +40 700 000 000</p>

          <p class="footer-text">✉️ support@gamevault.app</p>
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

/* footer */
.footer-box {
  margin-top: auto;
  padding: 14px;
}

.footer-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
}

.footer-title {
  margin: 0 0 6px;
  font-weight: 800;
  font-size: 14px;
}

.footer-text {
  margin: 2px 0;
  font-size: 12px;
  opacity: 0.75;
}
</style>
