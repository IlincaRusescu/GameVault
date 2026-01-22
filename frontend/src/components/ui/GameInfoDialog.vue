<template>
  <v-dialog v-model="model" max-width="900">
    <v-card rounded="lg">
      <v-card-title class="dialog-title">
        <span>{{ game?.name || 'Game info' }}</span>

        <div class="dialog-actions">
          <v-btn
            v-if="!isEditing"
            size="small"
            color="secondary"
            variant="flat"
            @click="enableEdit"
          >
            Update
          </v-btn>

          <v-btn
            v-else
            size="small"
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="saving"
            @click="onSave"
          >
            Save
          </v-btn>

          <v-btn size="small" variant="text" :disabled="saving" @click="close"> Close </v-btn>
        </div>
      </v-card-title>

      <v-card-text v-if="game">
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
          {{ errorMsg }}
        </v-alert>

        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              label="Name"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.category"
              label="Category"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.releaseYear"
              label="Release Year"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.complexity"
              label="Complexity"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.age"
              label="Age (ex: 10+)"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.publisher"
              label="Publisher"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.languageDependence"
              label="Language Dependence"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.shortDescription"
              label="Short Description"
              rows="3"
              auto-grow
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.tags"
              label="Tags"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hide-details="auto"
              :disabled="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.themes"
              label="Themes"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hide-details="auto"
              :disabled="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.mechanics"
              label="Mechanics"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hide-details="auto"
              :disabled="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.designers"
              label="Designers"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              hide-details="auto"
              :disabled="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.players.min"
              label="Players Min"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.players.max"
              label="Players Max"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.playTime.min"
              label="Play Time Min"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.playTime.max"
              label="Play Time Max"
              type="number"
              density="compact"
              hide-details="auto"
              :readonly="!isEditing"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else>
        <div class="py-6 text-center">No game selected.</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  game: { type: Object, default: null }, // must include .id
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEditing = ref(false)
const errorMsg = ref('')

const form = reactive({
  name: '',
  category: '',
  shortDescription: '',
  tags: [],
  themes: [],
  mechanics: [],
  designers: [],
  publisher: '',
  age: '',
  languageDependence: '',
  releaseYear: '',
  complexity: '',
  playTime: { min: '', max: '' },
  players: { min: '', max: '' },
})

watch(
  () => props.game,
  (g) => {
    if (!g) return

    form.name = g.name ?? ''
    form.category = g.category ?? ''
    form.shortDescription = g.shortDescription ?? ''
    form.tags = Array.isArray(g.tags) ? [...g.tags] : []
    form.themes = Array.isArray(g.themes) ? [...g.themes] : []
    form.mechanics = Array.isArray(g.mechanics) ? [...g.mechanics] : []
    form.designers = Array.isArray(g.designers) ? [...g.designers] : []
    form.publisher = g.publisher ?? ''
    form.age = g.age ?? ''
    form.languageDependence = g.languageDependence ?? ''
    form.releaseYear = g.releaseYear ?? ''
    form.complexity = g.complexity ?? ''
    form.playTime = { min: g.playTime?.min ?? '', max: g.playTime?.max ?? '' }
    form.players = { min: g.players?.min ?? '', max: g.players?.max ?? '' }

    isEditing.value = false
    errorMsg.value = ''
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      isEditing.value = false
      errorMsg.value = ''
    }
  },
)

function enableEdit() {
  isEditing.value = true
}

function close() {
  model.value = false
}

function sanitizeStringArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((x) => String(x || '').trim()).filter((x) => x.length > 0)
}

function toInt(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function toFloatOrNull(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n
}

function validate() {
  if (!String(form.name || '').trim()) return 'Name is required.'
  if (!String(form.category || '').trim()) return 'Category is required.'
  if (!String(form.shortDescription || '').trim()) return 'Short Description is required.'
  if (!Array.isArray(form.tags) || form.tags.length === 0) return 'Tags are required.'

  const year = toInt(form.releaseYear)
  if (year === null) return 'Release Year must be an integer.'
  if (year < 1900 || year > 2100) return 'Release Year must be between 1900 and 2100.'

  const ptMin = toInt(form.playTime.min)
  const ptMax = toInt(form.playTime.max)
  if (ptMin === null || ptMax === null || ptMin <= 0 || ptMax <= 0 || ptMin > ptMax) {
    return 'Play Time Min/Max must be valid integers and Min <= Max.'
  }

  const pMin = toInt(form.players.min)
  const pMax = toInt(form.players.max)
  if (pMin === null || pMax === null || pMin <= 0 || pMax <= 0 || pMin > pMax) {
    return 'Players Min/Max must be valid integers and Min <= Max.'
  }

  return ''
}

function onSave() {
  errorMsg.value = ''
  const err = validate()
  if (err) {
    errorMsg.value = err
    return
  }

  const docId = props.game?.id
  if (!docId) {
    errorMsg.value = 'Missing document id (id). Cannot update.'
    return
  }

  const payload = {
    id: docId, // used only for URL
    name: String(form.name).trim(),
    category: String(form.category).trim(),
    shortDescription: String(form.shortDescription).trim(),
    tags: sanitizeStringArray(form.tags),
    themes: sanitizeStringArray(form.themes),
    mechanics: sanitizeStringArray(form.mechanics),
    designers: sanitizeStringArray(form.designers),

    publisher: String(form.publisher || '').trim() || 'N/A',
    age: String(form.age || '').trim() || 'N/A',

    languageDependence: String(form.languageDependence || '').trim().length
      ? toInt(form.languageDependence)
      : 'N/A',

    releaseYear: toInt(form.releaseYear),

    complexity: String(form.complexity || '').trim().length
      ? toFloatOrNull(form.complexity)
      : 'N/A',

    playTime: { min: toInt(form.playTime.min), max: toInt(form.playTime.max) },
    players: { min: toInt(form.players.min), max: toInt(form.players.max) },

    updatedAt: new Date().toISOString(),
  }

  emit('save', payload)
  isEditing.value = false
}
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
