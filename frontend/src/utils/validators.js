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
