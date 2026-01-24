<template>
  <div class="games-view">
    <PageHeader :title="headerTitle" class="games-header">
      <v-btn
        size="small"
        variant="tonal"
        :loading="libraryStore.libraryLoading"
        :disabled="libraryStore.libraryLoading"
        @click="refresh"
      >
        Refresh
      </v-btn>
    </PageHeader>

    <v-card rounded="lg" variant="flat" class="table-card">
      <v-card-text class="table-card__content">
        <v-alert v-if="libraryStore.libraryError" type="error" variant="tonal" class="mb-4">
          {{ libraryStore.libraryError }}
        </v-alert>

        <!-- error sessions (optional) -->
        <v-alert v-if="sessionsStore.sessionsError" type="error" variant="tonal" class="mb-4">
          {{ sessionsStore.sessionsError }}
        </v-alert>

        <v-data-table
          :headers="activeHeaders"
          :items="libraryStore.libraryItems"
          :loading="libraryStore.libraryLoading"
          item-key="id"
          density="compact"
          fixed-header
          class="games-table"
        >
          <template #item.themes="{ item }">
            <span>{{ formatThemes(item.themes) }}</span>
          </template>

          <!-- Add Session column -->
          <template #item.session="{ item }">
            <div class="actions-cell">
              <v-btn
                size="small"
                color="primary"
                variant="flat"
                class="mr-2"
                :loading="sessionsStore.createLoading && selectedGameId === item.id"
                :disabled="sessionsStore.createLoading && selectedGameId === item.id"
                @click="openSessionDialog(item)"
              >
                Add Session
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                :loading="removeBusyId === item.id"
                :disabled="removeBusyId === item.id"
                @click="onRemove(item)"
              >
                Remove
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="py-6 text-center">Your library is empty.</div>
          </template>

          <template #loading>
            <div class="py-6 text-center">Loading your games...</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Session popup component -->
    <SessionDialog
      v-model="sessionDialog"
      mode="create"
      :loading="sessionsStore.createLoading"
      :game-name="selectedGameName"
      :date-text="todayText"
      :initial="createInitial"
      @submit="onCreateSession"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useLibraryStore } from '@/stores/library'

import { useSessionsStore } from '@/stores/sessions'
import SessionDialog from '@/components/ui/SessionDialog.vue'

const libraryStore = useLibraryStore()
const sessionsStore = useSessionsStore()

const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)

const headerTitle = computed(() => {
  const count = libraryStore.libraryCount
  return `My Games - ${count} games`
})

const desktopHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Theme', key: 'themes', sortable: true },
  { title: 'Complexity', key: 'complexity', sortable: true },
  { title: 'Add Session', key: 'session', sortable: false, align: 'end' },
]

// mobile view
const mobileHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Session', key: 'session', sortable: false, align: 'end' },
]

const activeHeaders = computed(() => (isMobile.value ? mobileHeaders : desktopHeaders))

onMounted(async () => {
  await libraryStore.fetchLibrary()
})

async function refresh() {
  await libraryStore.fetchLibrary()
}

function formatThemes(themes) {
  if (Array.isArray(themes) && themes.length) return themes.join(', ')
  return '—'
}

// session dialog state
const sessionDialog = ref(false)
const selectedGameId = ref('')
const selectedGameName = ref('')

// helpers for dialog
const todayText = computed(() => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
})

const createInitial = computed(() => ({
  durationMinutes: '',
  playersText: '',
  winner: '',
}))

function openSessionDialog(item) {
  selectedGameId.value = item.id
  selectedGameName.value = item.name || ''
  sessionDialog.value = true
}

async function onCreateSession(payload) {
  if (!selectedGameId.value) return

  const ok = await sessionsStore.createSession(selectedGameId.value, payload)
  if (ok) {
    sessionDialog.value = false
    selectedGameId.value = ''
    selectedGameName.value = ''
  }
}

/* remove from library */
const removeBusyId = ref(null)

async function onRemove(item) {
  if (!item?.id) return

  const ok = confirm(`Remove "${item.name}" from your library?`)
  if (!ok) return

  removeBusyId.value = item.id
  const success = await libraryStore.removeFromLibrary(item.id)
  removeBusyId.value = null

  // dacă ștergi jocul pe care ai dialog deschis, închidem dialogul
  if (success && selectedGameId.value === item.id) {
    sessionDialog.value = false
    selectedGameId.value = ''
    selectedGameName.value = ''
  }
}
</script>

<style scoped>
.games-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-card {
  flex: 1;
  min-height: 0;

  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.table-card__content {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.games-table {
  flex: 1;
  min-height: 0;
}

.games-table :deep(.v-table__wrapper) {
  height: 100%;
  overflow: auto;
}

.games-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #1b1b1b;
}

.games-table :deep(tbody td) {
  background: transparent;
}

/* actions */
.actions-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
</style>
