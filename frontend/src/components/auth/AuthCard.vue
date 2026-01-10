<template>
  <v-container fluid class="auth-container">
    <v-card class="auth-card pa-6" elevation="6" rounded="lg">
      <v-card-title class="text-h5 mb-1">
        {{ title }}
      </v-card-title>

      <v-card-subtitle v-if="subtitle" class="mb-4">
        {{ subtitle }}
      </v-card-subtitle>

      <v-card-text class="pa-0">
        <slot />
      </v-card-text>

      <v-card-actions v-if="$slots.footer" class="mt-4 pa-0">
        <slot name="footer" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  maxWidth: {
    type: Number,
    default: 420,
  },
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #1d1d1d 0%, #0f0f0f 60%);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 560px; /* ajustezi dacă vrei mai îngust */
}
</style>
