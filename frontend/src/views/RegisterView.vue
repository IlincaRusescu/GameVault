<template>
  <AuthCard
    title="Create account"
    subtitle="All fields are required."
    containerClass="py-8"
    :md="8"
    :lg="6"
    :xl="5"
  >
    <v-form ref="formRef" @submit.prevent="onSubmit" novalidate>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.trim="form.firstName"
            label="First name"
            :rules="[rules.firstName]"
            autocomplete="given-name"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.trim="form.lastName"
            label="Last name"
            :rules="[rules.lastName]"
            autocomplete="family-name"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="form.age"
            label="Age"
            type="number"
            :rules="[rules.age]"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-select
            v-model="form.gender"
            label="Gender"
            :items="genderItems"
            item-title="title"
            item-value="value"
            :rules="[rules.gender]"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.trim="form.city"
            label="City"
            :rules="[rules.city]"
            autocomplete="address-level2"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.trim="form.country"
            label="Country"
            :rules="[rules.country]"
            autocomplete="country-name"
            required
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model.trim="form.username"
            label="Username"
            :rules="[rules.username, rules.usernameAvailable]"
            @blur="triggerUsernameCheck"
            required
            hint="3–20 chars, starts with a letter, letters/numbers/_ only"
            persistent-hint
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model.trim="form.email"
            label="Email"
            type="email"
            :rules="[rules.email]"
            autocomplete="email"
            required
          />
        </v-col>

        <v-col cols="12" sm="6">
          <AuthPasswordField
            v-model="form.password"
            label="Password"
            autocomplete="new-password"
            :rules="[rules.password]"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <AuthPasswordField
            v-model="form.confirmPassword"
            label="Confirm password"
            autocomplete="new-password"
            :rules="[rules.confirmPassword]"
          />
        </v-col>

        <v-col cols="12" class="mt-2">
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            :disabled="loading"
          >
            Create account
          </v-btn>

          <AuthAlerts :error="submitError" />
        </v-col>

        <v-col cols="12" class="text-center">
          <RouterLink to="/login">Already have an account?</RouterLink>
        </v-col>
      </v-row>
    </v-form>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { checkUsername } from '@/services/authService'
import {
  validateName,
  validateAge,
  validateGender,
  validateCity,
  validateCountry,
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validators'

import AuthCard from '@/components/auth/AuthCard.vue'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import AuthAlerts from '@/components/auth/AuthAlerts.vue'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const submitError = ref('')

const genderItems = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
  { title: 'Other', value: 'other' },
  { title: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const form = reactive({
  firstName: '',
  lastName: '',
  age: null,
  gender: '',
  city: '',
  country: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// --- Username availability check (debounced + cache) ---
const usernameCache = new Map() // usernameLower -> boolean
let usernameTimer = null
const usernameAvailable = ref(true)

function triggerUsernameCheck() {
  const u = (form.username || '').trim()
  if (!u) return
  if (validateUsername(u)) return // if base validation fails, don't check backend

  clearTimeout(usernameTimer)
  usernameTimer = setTimeout(async () => {
    const key = u.toLowerCase()
    if (usernameCache.has(key)) {
      usernameAvailable.value = usernameCache.get(key)
      return
    }
    try {
      const data = await checkUsername(u) // { available: true/false }
      usernameAvailable.value = !!data.available
      usernameCache.set(key, usernameAvailable.value)
    } catch {
      // if backend fails, we block submit to be safe:
      usernameAvailable.value = false
    }
  }, 350)
}

const rules = {
  firstName: (v) => validateName(v, 'First name') || true,
  lastName: (v) => validateName(v, 'Last name') || true,
  age: (v) => validateAge(v) || true,
  gender: (v) => validateGender(v) || true,
  city: (v) => validateCity(v) || true,
  country: (v) => validateCountry(v) || true,
  username: (v) => validateUsername(v) || true,

  // ✅ async rule supported by Vuetify: return Promise<true|string> OR true|string
  usernameAvailable: async (v) => {
    const u = (v || '').trim()
    const baseErr = validateUsername(u)
    if (baseErr) return true // base rule shows error already
    const key = u.toLowerCase()

    if (usernameCache.has(key)) {
      return usernameCache.get(key) ? true : 'Username not available'
    }

    try {
      const data = await checkUsername(u)
      const ok = !!data.available
      usernameCache.set(key, ok)
      return ok ? true : 'Username not available'
    } catch {
      return 'Could not validate username. Please try again.'
    }
  },

  email: (v) => validateEmail(v) || true,
  password: (v) => validatePassword(v) || true,
  confirmPassword: (v) => validateConfirmPassword(form.password, v) || true,
}

async function onSubmit() {
  submitError.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    submitError.value = 'Please fix the highlighted fields.'
    return
  }

  loading.value = true
  try {
    await auth.register({
      firstName: form.firstName,
      lastName: form.lastName,
      age: form.age,
      gender: form.gender,
      city: form.city,
      country: form.country,
      username: form.username,
      email: form.email,
      password: form.password,
    })

    router.push('/dashboard')
  } catch (e) {
    // backend should return message "Username not available" with 409
    submitError.value = e?.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>
