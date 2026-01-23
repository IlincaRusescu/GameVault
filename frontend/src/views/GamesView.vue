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

          <template #no-data>
            <div class="py-6 text-center">Your library is empty.</div>
          </template>

          <template #loading>
            <div class="py-6 text-center">Loading your games...</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useLibraryStore } from '@/stores/library'

const libraryStore = useLibraryStore()

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
  { title: 'Release Year', key: 'releaseYear', sortable: true },
  { title: 'Complexity', key: 'complexity', sortable: true },
]

const mobileHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
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
</style>
