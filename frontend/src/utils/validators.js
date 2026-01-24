export function required(v, label = 'Field') {
  if (v === null || v === undefined) return `${label} is required.`
  if (typeof v === 'string' && v.trim().length === 0) return `${label} is required.`
  return ''
}

export function validateName(v, label) {
  const r = required(v, label)
  if (r) return r

  const s = String(v).trim()
  if (s.length < 2) return `${label} must be at least 2 characters.`
  if (s.length > 50) return `${label} must be at most 50 characters.`
  // letters + spaces + - '
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(s)) return `${label} can contain only letters, spaces, - and '.`
  return ''
}

export function validateAge(v) {
  const r = required(v, 'Age')
  if (r) return r
  const n = Number(v)
  if (!Number.isInteger(n)) return 'Age must be an integer.'
  if (n < 13) return 'Age must be at least 13.'
  if (n > 120) return 'Age must be at most 120.'
  return ''
}

export function validateGender(v) {
  const r = required(v, 'Gender')
  if (r) return r
  const allowed = ['male', 'female', 'other', 'prefer_not_to_say']
  if (!allowed.includes(v)) return 'Please select a valid gender.'
  return ''
}

export function validateCity(v) {
  const r = required(v, 'City')
  if (r) return r
  const s = String(v).trim()
  if (s.length < 2) return 'City must be at least 2 characters.'
  if (s.length > 80) return 'City must be at most 80 characters.'
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/.test(s)) return 'City contains invalid characters.'
  return ''
}

export function validateCountry(v) {
  const r = required(v, 'Country')
  if (r) return r
  const s = String(v).trim()
  if (s.length < 2) return 'Country must be at least 2 characters.'
  if (s.length > 80) return 'Country must be at most 80 characters.'
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/.test(s)) return 'Country contains invalid characters.'
  return ''
}

export function validateUsername(v) {
  const r = required(v, 'Username')
  if (r) return r
  const s = String(v).trim()

  if (s.length < 3) return 'Username must be at least 3 characters.'
  if (s.length > 20) return 'Username must be at most 20 characters.'

  // must start with letter, then letters/digits/underscore
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(s)) {
    return 'Username must start with a letter and can contain only letters, numbers, underscore.'
  }

  return ''
}

export function validateEmail(v) {
  const r = required(v, 'Email')
  if (r) return r

  const s = String(v).trim()
  // decent email regex for school projects
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
  if (!ok) return 'Please enter a valid email.'
  if (s.length > 254) return 'Email is too long.'
  return ''
}

export function validatePassword(v) {
  const r = required(v, 'Password')
  if (r) return r

  const s = String(v)
  if (s.length < 8) return 'Password must be at least 8 characters.'
  if (s.length > 64) return 'Password must be at most 64 characters.'
  if (!/[a-z]/.test(s)) return 'Password must contain at least one lowercase letter.'
  if (!/[A-Z]/.test(s)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(s)) return 'Password must contain at least one number.'
  if (!/[^\w\s]/.test(s)) return 'Password must contain at least one special character.'
  return ''
}

export function validateConfirmPassword(password, confirm) {
  const r = required(confirm, 'Confirm password')
  if (r) return r
  if (confirm !== password) return 'Passwords do not match.'
  return ''
}

// --------------------
// Catalog / Game validators
// --------------------

export function validateNonEmptyText(v, label = 'Field', min = 1, max = 200) {
  const r = required(v, label)
  if (r) return r

  const s = String(v).trim()
  if (s.length < min) return `${label} must be at least ${min} characters.`
  if (s.length > max) return `${label} must be at most ${max} characters.`
  return ''
}

export function validateReleaseYear(v) {
  const r = required(v, 'Release Year')
  if (r) return r

  const n = Number(v)
  if (!Number.isInteger(n)) return 'Release Year must be an integer.'
  if (n < 1900) return 'Release Year must be at least 1900.'
  if (n > 2100) return 'Release Year must be at most 2100.'
  return ''
}

export function validateMinMax(minV, maxV, label = 'Value') {
  const r1 = required(minV, `${label} Min`)
  if (r1) return r1
  const r2 = required(maxV, `${label} Max`)
  if (r2) return r2

  const minN = Number(minV)
  const maxN = Number(maxV)

  if (!Number.isInteger(minN) || !Number.isInteger(maxN)) return `${label} Min/Max must be integers.`
  if (minN <= 0 || maxN <= 0) return `${label} Min/Max must be greater than 0.`
  if (minN > maxN) return `${label} Min cannot be greater than ${label} Max.`
  return ''
}

export function validateTags(v) {
  if (!Array.isArray(v) || v.length === 0) return 'Tags are required.'
  const clean = v.map((x) => String(x || '').trim()).filter(Boolean)
  if (clean.length === 0) return 'Tags are required.'
  return ''
}

export function sanitizeStringArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((x) => String(x || '').trim()).filter((x) => x.length > 0)
}

// --------------------
// Library / Sessions
// --------------------

export function validateSessionForm({ durationMinutes, playersText, winner }) {
  const errors = {};

  const dur = Number(durationMinutes);
  if (!Number.isFinite(dur) || dur <= 0) {
    errors.durationMinutes = "Duration must be a positive number.";
  }

  // playersText: optional, dar dacă e complet gol -> warn (poți scoate dacă vrei)
  const pt = (playersText || "").toString().trim();
  if (!pt) {
    errors.playersText = "Please enter at least 1 player.";
  }

  // winner: optional (sau poți cere să fie unul din players - dar nu facem overengineering)
  if ((winner || "").toString().length > 60) {
    errors.winner = "Winner name is too long.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}