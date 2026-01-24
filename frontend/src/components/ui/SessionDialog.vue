<template>
  <v-dialog v-model="model" max-width="620">
    <v-card rounded="lg">
      <v-card-title class="dialog-title">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <div class="mb-3 hint">
          <b>{{ gameName }}</b>
          <span v-if="showDate && dateText"> • {{ dateText }}</span>
        </div>

        <v-text-field
          v-model="form.durationMinutes"
          label="Duration (minutes)"
          variant="outlined"
          type="number"
          :error="!!errors.durationMinutes"
          :error-messages="errors.durationMinutes"
        />

        <v-textarea
          v-model="form.playersText"
          label="Players (one per line)"
          variant="outlined"
          auto-grow
          rows="5"
          placeholder="Ana&#10;Mihai&#10;Dani"
          :error="!!errors.playersText"
          :error-messages="errors.playersText"
        />

        <v-text-field
          v-model="form.winner"
          label="Winner"
          variant="outlined"
          :error="!!errors.winner"
          :error-messages="errors.winner"
        />
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" @click="onCancel">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          :disabled="loading"
          @click="onSubmit"
        >
          {{ submitText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
// IMPORTANT: ajustează path-ul dacă la tine e altul
import { validateSessionForm } from '@/utils/validators'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // "create" | "edit"
  loading: { type: Boolean, default: false },
  gameName: { type: String, default: '' },
  dateText: { type: String, default: '' },
  showDate: { type: Boolean, default: true },
  initial: {
    type: Object,
    default: () => ({
      durationMinutes: '',
      playersText: '',
      winner: '',
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  durationMinutes: '',
  playersText: '',
  winner: '',
})

const errors = reactive({
  durationMinutes: '',
  playersText: '',
  winner: '',
})

const title = computed(() => (props.mode === 'edit' ? 'Edit Session' : 'Add Session'))

const submitText = computed(() => (props.mode === 'edit' ? 'Save' : 'Create'))

function resetErrors() {
  errors.durationMinutes = ''
  errors.playersText = ''
  errors.winner = ''
}

function fillFromInitial() {
  form.durationMinutes = props.initial?.durationMinutes ?? ''
  form.playersText = props.initial?.playersText ?? ''
  form.winner = props.initial?.winner ?? ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetErrors()
      fillFromInitial()
    }
  },
)

function onCancel() {
  model.value = false
}

function onSubmit() {
  resetErrors()

  // validators centralizate
  const result = validateSessionForm({
    durationMinutes: form.durationMinutes,
    playersText: form.playersText,
    winner: form.winner,
  })

  if (!result.isValid) {
    errors.durationMinutes = result.errors.durationMinutes || ''
    errors.playersText = result.errors.playersText || ''
    errors.winner = result.errors.winner || ''
    return
  }

  emit('submit', {
    durationMinutes: Number(form.durationMinutes),
    playersText: (form.playersText || '').toString(),
    winner: (form.winner || '').toString(),
  })
}
</script>

<style scoped>
.dialog-title {
  font-weight: 800;
}

.dialog-actions {
  padding: 12px 16px 16px;
}

.hint {
  opacity: 0.85;
}
</style>
