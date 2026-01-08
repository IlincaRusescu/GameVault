<template>
  <div class="app">
    <AppNavbar />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from './AppNavbar.vue'
</script>

<style scoped>
.content {
  padding: 16px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
