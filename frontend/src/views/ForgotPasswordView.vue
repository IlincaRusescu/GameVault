<template>
  <AuthCard title="Reset password" subtitle="Enter your email and we’ll send you a reset link.">
    <v-form ref="formRef" @submit.prevent="onSubmit" novalidate>
      <v-text-field
        v-model.trim="email"
        label="Email"
        type="email"
        autocomplete="email"
        :rules="[rules.email]"
        required
      />

      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        :loading="loading"
        :disabled="loading"
        class="mt-2"
      >
        Send reset email
      </v-btn>

      <AuthAlerts :success="success" :error="error" />

      <template #footer>
        <div class="text-body-2">
          <RouterLink to="/login">Back to login</RouterLink>
        </div>
      </template>
    </v-form>
  </AuthCard>
</template>

<script setup>
import { ref } from 'vue'
import { forgotPassword } from '@/services/authService'
import { validateEmail } from '@/utils/validators'

import AuthCard from '@/components/auth/AuthCard.vue'
import AuthAlerts from '@/components/auth/AuthAlerts.vue'

const formRef = ref(null)
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const rules = {
  email: (v) => validateEmail(v) || true,
}

async function onSubmit() {
  error.value = ''
  success.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    error.value = 'Please enter a valid email.'
    return
  }

  loading.value = true
  try {
    await forgotPassword(email.value)
    success.value = 'Check your inbox for the reset link.'
  } catch (e) {
    error.value = e?.message || 'Could not send reset email.'
  } finally {
    loading.value = false
  }
}
</script>
