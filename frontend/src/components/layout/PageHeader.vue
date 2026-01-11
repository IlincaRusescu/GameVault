<template>
  <div class="page-header">
    <h2 class="title">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 14px 16px;
  margin-bottom: 16px;

  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.title {
  margin: 0;
  color: white;
  font-size: 26px;
  font-weight: 800;
}
</style>
