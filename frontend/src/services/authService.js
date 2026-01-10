const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  return data
}

export function login(payload) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function checkUsername(username) {
  const u = encodeURIComponent(username)
  return request(`/api/auth/check-username?username=${u}`, { method: 'GET' })
}

export function forgotPassword(email) {
  return request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

export function resetPassword(oobCode, newPassword) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ oobCode, newPassword }),
  })
}
