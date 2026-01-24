<template>
  <div class="dashboard-view">
    <PageHeader title="Dashboard" />

    <div class="cards-wrap">
      <div class="cards-row">
        <GameCard title="Games" :value="gamesCount" tone="primary" />

        <GameCard title="Sessions" :value="sessionsCount" tone="secondary" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import GameCard from '@/components/ui/GameCard.vue'
import { useLibraryStore } from '@/stores/library'
import { useSessionsStore } from '@/stores/sessions'

const libraryStore = useLibraryStore()
const sessionsStore = useSessionsStore()

const gamesCount = computed(() => libraryStore.libraryCount || 0)
const sessionsCount = computed(() => (sessionsStore.sessionsItems || []).length)

onMounted(async () => {
  // Minimal: doar refresh de data
  await libraryStore.fetchLibrary()
  await sessionsStore.fetchAllSessions()
})
</script>

<style scoped>
.dashboard-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* center cards under header */
.cards-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.cards-row {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 700px) {
  .cards-row {
    grid-template-columns: 1fr;
  }
}
</style>
