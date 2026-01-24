<template>
  <div class="sessions-view">
    <PageHeader :title="headerTitle" class="sessions-header">
      <v-btn
        size="small"
        variant="tonal"
        :loading="sessionsStore.sessionsLoading"
        :disabled="sessionsStore.sessionsLoading"
        @click="refresh"
      >
        Refresh
      </v-btn>
    </PageHeader>

    <v-card rounded="lg" variant="flat" class="table-card">
      <v-card-text class="table-card__content">
        <v-alert v-if="sessionsStore.sessionsError" type="error" variant="tonal" class="mb-4">
          {{ sessionsStore.sessionsError }}
        </v-alert>

        <v-data-table
          :headers="activeHeaders"
          :items="sessionsStore.sessionsItems"
          :loading="sessionsStore.sessionsLoading"
          item-key="id"
          density="compact"
          fixed-header
          class="sessions-table"
        >
          <template #item.createdAt="{ item }">
            <span>{{ formatDate(item.createdAt) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="actions-cell">
              <v-btn
                size="small"
                color="secondary"
                variant="flat"
                class="mr-2"
                @click="openEdit(item)"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                :loading="deleteBusyId === item.id"
                :disabled="deleteBusyId === item.id"
                @click="openDeleteDialog(item)"
              >
                Delete
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="py-6 text-center">No sessions yet.</div>
          </template>

          <template #loading>
            <div class="py-6 text-center">Loading sessions...</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Reuse your UI dialog for edit -->
    <SessionDialog
      v-model="editDialog"
      mode="edit"
      :loading="sessionsStore.updateLoading"
      :game-name="selectedSession?.gameName || ''"
      :date-text="formatDate(selectedSession?.createdAt)"
      :initial="editInitial"
      @submit="onEditSubmit"
    />

    <!-- Confirm delete session -->
    <ConfirmDialog
      v-model="deleteDialog"
      title="Delete session"
      :message="deleteTarget ? `Delete session for &quot;${deleteTarget.gameName}&quot;?` : ''"
      confirm-text="Delete"
      confirm-color="error"
      :loading="deleteBusyId === (deleteTarget?.id || null)"
      @confirm="confirmDelete"
      @cancel="closeDeleteDialog"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeader from '@/components/layout/PageHeader.vue'
import SessionDialog from '@/components/ui/SessionDialog.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useSessionsStore } from '@/stores/sessions'

const sessionsStore = useSessionsStore()

const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)

const headerTitle = computed(() => {
  const count = (sessionsStore.sessionsItems || []).length
  return `My Sessions - ${count}`
})

// Desktop: Name - Date - Duration - Winner + actions
const desktopHeaders = [
  { title: 'Name', key: 'gameName', sortable: true },
  { title: 'Date', key: 'createdAt', sortable: true },
  { title: 'Duration', key: 'durationMinutes', sortable: true },
  { title: 'Winner', key: 'winner', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

// Mobile: Name - Date + actions (minimal)
const mobileHeaders = [
  { title: 'Name', key: 'gameName', sortable: true },
  { title: 'Date', key: 'createdAt', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const activeHeaders = computed(() => (isMobile.value ? mobileHeaders : desktopHeaders))

onMounted(async () => {
  await sessionsStore.fetchAllSessions()
})

async function refresh() {
  await sessionsStore.fetchAllSessions()
}

function formatDate(createdAt) {
  if (!createdAt) return '—'

  let date = null

  if (typeof createdAt?.toDate === 'function') {
    date = createdAt.toDate()
  } else if (typeof createdAt === 'object') {
    const seconds =
      typeof createdAt._seconds === 'number'
        ? createdAt._seconds
        : typeof createdAt.seconds === 'number'
          ? createdAt.seconds
          : null

    if (seconds !== null) {
      date = new Date(seconds * 1000)
    }
  }

  if (!date) date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

// Edit flow
const editDialog = ref(false)
const selectedSession = ref(null)

const editInitial = computed(() => ({
  durationMinutes: selectedSession.value?.durationMinutes ?? '',
  playersText: selectedSession.value?.playersText ?? '',
  winner: selectedSession.value?.winner ?? '',
}))

function openEdit(item) {
  selectedSession.value = item
  editDialog.value = true
}

async function onEditSubmit(payload) {
  if (!selectedSession.value?.gameId || !selectedSession.value?.id) return

  const ok = await sessionsStore.updateSession(
    selectedSession.value.gameId,
    selectedSession.value.id,
    payload,
  )

  if (ok) {
    editDialog.value = false
    selectedSession.value = null
  }
}

// Delete (Vuetify confirm + finally)
const deleteBusyId = ref(null)
const deleteDialog = ref(false)
const deleteTarget = ref(null)

function openDeleteDialog(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

function closeDeleteDialog() {
  deleteDialog.value = false
  deleteTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value?.gameId || !deleteTarget.value?.id) return

  const sessionId = deleteTarget.value.id
  deleteBusyId.value = sessionId

  try {
    await sessionsStore.deleteSession(deleteTarget.value.gameId, sessionId)
  } finally {
    deleteBusyId.value = null
    closeDeleteDialog()
  }
}
</script>

<style scoped>
.sessions-view {
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

.sessions-table {
  flex: 1;
  min-height: 0;
}

.sessions-table :deep(.v-table__wrapper) {
  height: 100%;
  overflow: auto;
}

.sessions-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #1b1b1b;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
</style>
