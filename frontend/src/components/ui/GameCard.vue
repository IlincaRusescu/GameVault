<template>
  <v-card class="game-card">
    <v-card-title class="title-row">
      <span>{{ game.name }}</span>

      <v-chip
        size="small"
        class="cat-chip"
        :style="{ backgroundColor: categoryColor(game.category) }"
      >
        {{ game.category }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div class="muted">
        {{ game.players.min }}–{{ game.players.max }} players • {{ game.playTime.min }}–{{
          game.playTime.max
        }}
        min •
        {{ game.age }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { categoryColor } from '@/utils/categoryColors'

defineProps({
  game: { type: Object, required: true },
})
</script>

<style scoped>
.game-card {
  background: #1b1b1b;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.cat-chip {
  color: #111;
  font-weight: 800;
}
.muted {
  opacity: 0.75;
}
</style>
