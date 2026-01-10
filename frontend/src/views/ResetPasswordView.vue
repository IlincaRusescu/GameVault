<template>
  <AuthCard title="Set a new password" subtitle="Enter your new password below.">
    <v-form ref="formRef" @submit.prevent="onSubmit" novalidate>
      <AuthPasswordField
        v-model="password"
        label="New password"
        autocomplete="new-password"
        :rules="[rules.password]"
      />

      <AuthPasswordField
        v-model="confirmPassword"
        label="Confirm new password"
        autocomplete="new-password"
        :rules="[rules.confirm]"
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
        Update password
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
import { useRoute } from 'vue-router'
import { resetPassword } from '@/services/authService'
import { validatePassword } from '@/utils/validators'

import AuthCard from '@/components/auth/AuthCard.vue'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import AuthAlerts from '@/components/auth/AuthAlerts.vue'

const route = useRoute()
const oobCode = route.query.oobCode?.toString() || ''

const formRef = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

const password = ref('')
const confirmPassword = ref('')

const rules = {
  password: (v) => validatePassword(v) || true,
  confirm: (v) => {
    if (!v) return 'Please confirm your password.'
    if (v !== password.value) return 'Passwords do not match.'
    return true
  },
}

async function onSubmit() {
  error.value = ''
  success.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    error.value = 'Please fix the highlighted fields.'
    return
  }

  if (!oobCode) {
    error.value = 'Invalid or missing reset code. Please request a new reset link.'
    return
  }

  loading.value = true
  try {
    await resetPassword(oobCode, password.value)
    success.value = 'Password updated successfully. You can now log in.'
  } catch (e) {
    error.value = e?.message || 'Could not reset password. Please request a new link.'
  } finally {
    loading.value = false
  }
}
</script>
