<template>
  <button class="btn" :type="type">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'button' },
})
</script>

<style scoped>
.btn {
  padding: 10px 14px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  background: #111;
  color: #fff;
}
</style>
