<template>
  <v-card class="game-card" :class="toneClass">
    <!-- TITLE -->
    <v-card-title class="title-row">
      <slot name="title">
        <span class="title-text">{{ title }}</span>
      </slot>
    </v-card-title>

    <!-- VALUE -->
    <v-card-text class="card-body">
      <slot name="value">
        <div class="big-value">{{ value }}</div>
      </slot>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  tone: { type: String, default: 'default' }, // default | primary | secondary
})

const toneClass = computed(() => {
  if (props.tone === 'primary') return 'tone-primary'
  if (props.tone === 'secondary') return 'tone-secondary'
  return 'tone-default'
})
</script>

<style scoped>
/* =========================
   BASE CARD
========================= */
.game-card {
  background: #1b1b1b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 160px; /* mobile default */
}

/* =========================
   TITLE
========================= */
.title-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 12px 6px;
}

.title-text {
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.3px;
  text-align: center;
}

/* =========================
   BODY / VALUE
========================= */
.card-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px 18px;
}

.big-value {
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
}

/* =========================
   ACCENTS
========================= */
.tone-primary {
  border-color: rgba(254, 145, 0, 0.45);
}
.tone-primary .title-text,
.tone-primary .big-value {
  color: #fe9100;
}

.tone-secondary {
  border-color: rgba(107, 142, 35, 0.45);
}
.tone-secondary .title-text,
.tone-secondary .big-value {
  color: #6b8e23;
}

/* =========================
   DESKTOP / TABLET
========================= */
@media (min-width: 768px) {
  .game-card {
    min-height: 220px;
  }

  .title-text {
    font-size: 22px;
  }

  .big-value {
    font-size: 72px;
  }
}

@media (min-width: 1200px) {
  .game-card {
    min-height: 260px;
  }

  .title-text {
    font-size: 26px;
  }

  .big-value {
    font-size: 88px;
  }
}
</style>
