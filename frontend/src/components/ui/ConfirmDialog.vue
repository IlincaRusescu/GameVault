<template>
  <v-dialog v-model="model" max-width="520">
    <v-card rounded="lg" class="confirm-card">
      <v-card-title class="confirm-title">
        {{ title }}
      </v-card-title>

      <v-card-text class="confirm-text">
        {{ message }}
      </v-card-text>

      <v-card-actions class="confirm-actions">
        <v-spacer />
        <v-btn variant="text" @click="cancel" :disabled="loading">Cancel</v-btn>
        <v-btn :color="confirmColor" variant="flat" @click="confirm" :loading="loading">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Delete' },
  confirmColor: { type: String, default: 'error' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function cancel() {
  emit('cancel')
  model.value = false
}

function confirm() {
  emit('confirm')
}
</script>

<style scoped>
.confirm-card {
  background: #1b1b1b;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.confirm-title {
  font-weight: 900;
}
.confirm-text {
  opacity: 0.85;
}
.confirm-actions {
  padding: 12px 16px 16px;
}
</style>
