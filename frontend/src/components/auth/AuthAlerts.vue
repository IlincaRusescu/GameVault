<template>
  <div>
    <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
      {{ success }}
    </v-alert>

    <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
defineProps({
  success: { type: String, default: '' },
  error: { type: String, default: '' },
})
</script>
