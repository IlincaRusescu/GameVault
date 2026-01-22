<template>
  <v-dialog v-model="model" max-width="900" persistent>
    <v-card rounded="lg">
      <v-card-title>Add New Game</v-card-title>

      <v-card-text>
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
          {{ errorMsg }}
        </v-alert>

        <v-form>
          <v-row dense>
            <!-- Mandatory -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Name"
                density="compact"
                hide-details="auto"
                :error="touched && !!nameError"
                :error-messages="touched ? nameError : ''"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.category"
                label="Category"
                density="compact"
                hide-details="auto"
                :error="touched && !!categoryError"
                :error-messages="touched ? categoryError : ''"
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
                :error="touched && !!descError"
                :error-messages="touched ? descError : ''"
              />
            </v-col>

            <v-col cols="12">
              <v-combobox
                v-model="form.tags"
                label="Tags (mandatory)"
                multiple
                chips
                closable-chips
                clearable
                density="compact"
                hide-details="auto"
                :error="touched && !!tagsError"
                :error-messages="touched ? tagsError : ''"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.releaseYear"
                label="Release Year"
                type="number"
                density="compact"
                hide-details="auto"
                :error="touched && !!yearError"
                :error-messages="touched ? yearError : ''"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.playTime.min"
                label="Play Time Min (minutes)"
                type="number"
                density="compact"
                hide-details="auto"
                :error="touched && !!playTimeError"
                :error-messages="touched ? playTimeError : ''"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.playTime.max"
                label="Play Time Max (minutes)"
                type="number"
                density="compact"
                hide-details="auto"
                :error="touched && !!playTimeError"
                :error-messages="touched ? playTimeError : ''"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.players.min"
                label="Players Min"
                type="number"
                density="compact"
                hide-details="auto"
                :error="touched && !!playersError"
                :error-messages="touched ? playersError : ''"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.players.max"
                label="Players Max"
                type="number"
                density="compact"
                hide-details="auto"
                :error="touched && !!playersError"
                :error-messages="touched ? playersError : ''"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="my-4" />
            </v-col>

            <!-- Optional -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.age"
                label="Age (ex: 10+)"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.languageDependence"
                label="Language Dependence"
                type="number"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.publisher"
                label="Publisher"
                density="compact"
                hide-details="auto"
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
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.complexity"
                label="Complexity"
                type="number"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="close" :disabled="loading"> Cancel </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="save"
          :loading="loading"
          :disabled="loading || !canSave"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  validateNonEmptyText,
  validateTags,
  validateReleaseYear,
  validateMinMax,
  sanitizeStringArray,
  required,
} from '@/utils/validators'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  existingGameIds: { type: Array, default: () => [] }, // ["game_1", ...]
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const touched = ref(false)
const errorMsg = ref('')

const form = reactive({
  // mandatory
  category: '',
  name: '',
  shortDescription: '',
  tags: [],
  playTime: { min: '', max: '' },
  players: { min: '', max: '' },
  releaseYear: '',

  // optional
  age: '',
  languageDependence: '',
  publisher: '',
  designers: [],
  mechanics: [],
  themes: [],
  complexity: '',
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
  },
)

function reset() {
  form.category = ''
  form.name = ''
  form.shortDescription = ''
  form.tags = []
  form.playTime.min = ''
  form.playTime.max = ''
  form.players.min = ''
  form.players.max = ''
  form.releaseYear = ''

  form.age = ''
  form.languageDependence = ''
  form.publisher = ''
  form.designers = []
  form.mechanics = []
  form.themes = []
  form.complexity = ''

  touched.value = false
  errorMsg.value = ''
}

function toInt(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function toFloat(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n
}

const nameError = computed(() => validateNonEmptyText(form.name, 'Name', 2, 80))
const categoryError = computed(() => validateNonEmptyText(form.category, 'Category', 2, 80))
const descError = computed(() =>
  validateNonEmptyText(form.shortDescription, 'Short Description', 10, 1000),
)
const tagsError = computed(() => validateTags(form.tags))
const yearError = computed(() => validateReleaseYear(form.releaseYear))
const playTimeError = computed(() =>
  validateMinMax(form.playTime.min, form.playTime.max, 'Play Time'),
)
const playersError = computed(() => validateMinMax(form.players.min, form.players.max, 'Players'))

const canSave = computed(() => {
  return (
    !nameError.value &&
    !categoryError.value &&
    !descError.value &&
    !tagsError.value &&
    !yearError.value &&
    !playTimeError.value &&
    !playersError.value
  )
})

function nextGameId() {
  let max = 0
  for (const id of props.existingGameIds) {
    const m = String(id || '').match(/^game_(\d+)$/i)
    if (m && m[1]) {
      const n = parseInt(m[1], 10)
      if (Number.isFinite(n) && n > max) max = n
    }
  }
  return `game_${max + 1}`
}

function close() {
  model.value = false
}

function save() {
  touched.value = true
  errorMsg.value = ''

  if (!canSave.value) {
    errorMsg.value = 'Please fix the validation errors and try again.'
    return
  }

  const now = new Date().toISOString()

  const payload = {
    gameId: nextGameId(),

    // mandatory
    category: String(form.category).trim(),
    name: String(form.name).trim(),
    shortDescription: String(form.shortDescription).trim(),
    tags: sanitizeStringArray(form.tags),

    playTime: {
      min: toInt(form.playTime.min),
      max: toInt(form.playTime.max),
    },
    players: {
      min: toInt(form.players.min),
      max: toInt(form.players.max),
    },

    releaseYear: toInt(form.releaseYear),

    // optional
    age: String(form.age || '').trim() || 'N/A',
    languageDependence:
      String(form.languageDependence || '').trim().length > 0
        ? toInt(form.languageDependence)
        : 'N/A',
    publisher: String(form.publisher || '').trim() || 'N/A',
    designers: sanitizeStringArray(form.designers),
    mechanics: sanitizeStringArray(form.mechanics),
    themes: sanitizeStringArray(form.themes),
    complexity: String(form.complexity || '').trim().length > 0 ? toFloat(form.complexity) : 'N/A',

    createdAt: now,
    updatedAt: now,
  }

  emit('save', payload)
}
</script>
