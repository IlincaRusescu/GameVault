<template>
  <div class="layout-root">
    <AppNavbar v-model:drawer="drawer" :is-mobile="isMobile" />
    <AppSidebar v-model:drawer="drawer" :is-mobile="isMobile" />

    <v-main class="app-main">
      <v-container fluid class="app-container">
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useDisplay } from 'vuetify'

import AppNavbar from './AppNavbar.vue'
import AppSidebar from './AppSidebar.vue'

const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)

const drawer = ref(true)
watchEffect(() => {
  drawer.value = !isMobile.value
})
</script>

<style scoped>
.layout-root {
  height: 100vh;
}

.app-main {
  background: #111111;
  height: 100%;
}

/* IMPORTANT: containerul trebuie sa aiba height ca view-urile sa poata umple */
.app-container {
  height: 100%;
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  color: white;
}
</style>
