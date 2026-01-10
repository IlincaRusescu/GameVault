<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5">Games</h2>

      <v-btn color="primary" variant="outlined" @click="onLogout"> Logout </v-btn>
    </div>

    <!-- restul paginii tale -->
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function onLogout() {
  auth.logout() // șterge token + user din localStorage
  router.push('/login') // te trimite la login
}
</script>
