<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :label="label"
    :type="show ? 'text' : 'password'"
    :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
    @click:append-inner="show = !show"
    :autocomplete="autocomplete"
    :rules="rules"
    :required="required"
  />
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Password' },
  autocomplete: { type: String, default: 'current-password' },
  rules: { type: Array, default: () => [] },
  required: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])

const show = ref(false)
</script>
