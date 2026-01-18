<template>
  <div class="page-header">
    <h2 class="title">{{ title }}</h2>
    <div class="actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<style scoped>
.page-header {
  position: sticky;
  top: 5px;
  z-index: 6;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;

  background: #111111;
}

.page-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  pointer-events: none;
}

.title,
.actions {
  position: relative;
  z-index: 1;
}

.title {
  margin: 0;
  color: white;
  font-size: 26px;
  font-weight: 800;
}

/* actions wrap for responsiveness */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
