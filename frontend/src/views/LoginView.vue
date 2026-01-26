<template>
  <AuthCard title="Login" subtitle="Log in to access GameVault.">
    <v-form ref="formRef" @submit.prevent="onSubmit" novalidate>
      <v-text-field
        v-model.trim="email"
        label="Email"
        type="email"
        autocomplete="email"
        :rules="[rules.email]"
        required
      />

      <AuthPasswordField
        v-model="password"
        label="Password"
        autocomplete="current-password"
        :rules="[rules.password]"
      />

      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        class="mt-2"
        :loading="loading"
        :disabled="loading"
      >
        Login
      </v-btn>

      <AuthAlerts :error="error" :success="success" />
    </v-form>

    <template #footer>
      <div class="auth-footer">
        <RouterLink to="/" class="back-link"> ← Back </RouterLink>
        <RouterLink to="/forgot-password" class="center-link"> Forgot password? </RouterLink>
        <RouterLink to="/register" class="right-link"> Create account </RouterLink>
      </div>
    </template>
  </AuthCard>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail } from '@/utils/validators'

import AuthCard from '@/components/auth/AuthCard.vue'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import AuthAlerts from '@/components/auth/AuthAlerts.vue'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')

const rules = {
  email: (v) => validateEmail(v) || true,
  password: (v) => (!v ? 'Password is required.' : true),
}

async function onSubmit() {
  error.value = ''
  success.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    error.value = 'Please fix the highlighted fields.'
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    success.value = 'Logged in successfully!'
    router.push('/dashboard')
  } catch (e) {
    error.value = e?.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  font-size: 14px;
}
.back-link {
  justify-self: start;
  text-decoration: none;
  font-weight: 500;
}
.center-link {
  justify-self: center;
  text-decoration: none;
}
.right-link {
  justify-self: end;
  text-decoration: none;
}
.center-link:hover,
.right-link:hover,
.back-link:hover {
  text-decoration: underline;
}
</style>
