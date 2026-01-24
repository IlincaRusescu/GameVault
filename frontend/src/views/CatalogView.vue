<template>
  <div class="catalog-view">
    <PageHeader :title="headerTitle" class="catalog-header">
      <v-btn size="small" variant="flat" color="primary" @click="openCreateDialog">
        Add New Game
      </v-btn>

      <v-btn
        size="small"
        variant="tonal"
        :loading="gamesStore.catalogLoading"
        :disabled="gamesStore.catalogLoading"
        @click="refresh"
      >
        Refresh
      </v-btn>
    </PageHeader>

    <v-card rounded="lg" variant="flat" class="table-card">
      <v-card-text class="table-card__content">
        <v-alert v-if="gamesStore.catalogError" type="error" variant="tonal" class="mb-4">
          {{ gamesStore.catalogError }}
        </v-alert>

        <v-alert v-if="libraryStore.libraryError" type="error" variant="tonal" class="mb-4">
          {{ libraryStore.libraryError }}
        </v-alert>

        <v-data-table
          :headers="activeHeaders"
          :items="gamesStore.sortedCatalog"
          :loading="gamesStore.catalogLoading"
          item-key="id"
          density="compact"
          fixed-header
          class="catalog-table"
        >
          <!-- Theme display (themes is an array -> show as "A, B") -->
          <template #item.themes="{ item }">
            <span>{{ formatThemes(item.themes) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="actions-cell">
              <!-- INFO button (secondary) -->
              <v-btn
                v-if="isMobile"
                size="small"
                color="secondary"
                variant="flat"
                class="info-btn"
                @click="openInfo(item)"
                :title="'Info'"
              >
                i
              </v-btn>

              <v-btn
                v-else
                size="small"
                color="secondary"
                variant="flat"
                class="info-btn"
                @click="openInfo(item)"
              >
                Info
              </v-btn>

              <!-- ADD button -->
              <v-btn
                v-if="isMobile"
                size="small"
                color="primary"
                variant="flat"
                class="plus-btn"
                :disabled="isInLibrary(item.id) || addBusyId === item.id"
                :loading="addBusyId === item.id"
                @click="onAddToLibrary(item)"
                :title="isInLibrary(item.id) ? 'Already in library' : 'Add in library'"
              >
                +
              </v-btn>

              <v-btn
                v-else
                size="small"
                color="primary"
                class="library-btn"
                :disabled="isInLibrary(item.id) || addBusyId === item.id"
                :loading="addBusyId === item.id"
                @click="onAddToLibrary(item)"
              >
                {{ isInLibrary(item.id) ? 'In Library' : '+ Add in library' }}
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="py-6 text-center">No games found.</div>
          </template>

          <template #loading>
            <div class="py-6 text-center">Loading catalog...</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <NewGameDialog
      v-model="createDialog"
      :existing-game-ids="existingGameIds"
      :loading="gamesStore.catalogCreateLoading"
      @save="onSaveNewGame"
    />

    <GameInfoDialog
      v-model="infoDialog"
      :game="selectedGame"
      :saving="gamesStore.catalogUpdateLoading"
      @save="onSaveGameUpdate"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeader from '@/components/layout/PageHeader.vue'
import NewGameDialog from '@/components/ui/NewGameDialog.vue'
import GameInfoDialog from '@/components/ui/GameInfoDialog.vue'
import { useGamesStore } from '@/stores/games'
import { useLibraryStore } from '@/stores/library'

const gamesStore = useGamesStore()
const libraryStore = useLibraryStore()
const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)

const headerTitle = computed(() => {
  const count = gamesStore.sortedCatalog.length
  return `Catalog - ${count} games found`
})

const desktopHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Theme', key: 'themes', sortable: true },
  { title: 'Release Year', key: 'releaseYear', sortable: true },
  { title: 'Complexity', key: 'complexity', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const mobileHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const activeHeaders = computed(() => (isMobile.value ? mobileHeaders : desktopHeaders))

onMounted(async () => {
  await Promise.all([gamesStore.fetchCatalog(), libraryStore.fetchLibrary()])
})

async function refresh() {
  await gamesStore.fetchCatalog()
  await libraryStore.fetchLibrary()
}

function formatThemes(themes) {
  if (Array.isArray(themes) && themes.length) return themes.join(', ')
  return '—'
}

function isInLibrary(id) {
  return libraryStore.isInLibrary(id)
}

const addBusyId = ref(null)

async function onAddToLibrary(item) {
  if (!item?.id) return
  if (isInLibrary(item.id)) return

  addBusyId.value = item.id
  try {
    await libraryStore.addToLibrary(item.id)
  } finally {
    addBusyId.value = null
  }
}

/* dialog state + save handler */
const createDialog = ref(false)

const existingGameIds = computed(() =>
  gamesStore.sortedCatalog.map((g) => String(g.gameId || '')).filter(Boolean),
)

function openCreateDialog() {
  createDialog.value = true
}

async function onSaveNewGame(payload) {
  console.log('SAVE PAYLOAD:', payload)
  await gamesStore.createCatalogGame(payload)
  await gamesStore.fetchCatalog()
  createDialog.value = false
}

/* info dialog state */
const infoDialog = ref(false)
const selectedGame = ref(null)

function openInfo(item) {
  selectedGame.value = item
  infoDialog.value = true
}

async function onSaveGameUpdate(payload) {
  const id = payload.id
  const body = { ...payload }
  delete body.id

  await gamesStore.updateCatalogGame(id, body)
  await gamesStore.fetchCatalog()

  infoDialog.value = false
  selectedGame.value = null
}
</script>

<style scoped>
/* 100hv */
.catalog-view {
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

/* Continutul cardului - layout vertical - tabelul ocupa tot */
.table-card__content {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Tabelul ocupa tot ce ramane sub alert (daca exista) */
.catalog-table {
  flex: 1;
  min-height: 0;
}

/* Scroller tabelului */
.catalog-table :deep(.v-table__wrapper) {
  height: 100%;
  overflow: auto;
}

/* Sticky header: aplicam pe th */
.catalog-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #1b1b1b;
}

/* Ca sa nu se "amestece" randurile cu headerul */
.catalog-table :deep(tbody td) {
  background: transparent;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.plus-btn {
  min-width: 36px;
  padding: 0 10px;
  font-weight: 800;
}
.info-btn {
  min-width: 44px;
  padding: 0 12px;
  font-weight: 700;
  margin-right: 5px;
}

.library-btn {
  min-width: 150px; /* Alege ce arată bine: 140–160 */
  justify-content: center;
}
</style>
