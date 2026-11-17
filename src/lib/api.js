const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

export function getSession() {
  try { return JSON.parse(localStorage.getItem('spendwise-session') || 'null') } catch { return null }
}

export function setSession(session) {
  if (session) localStorage.setItem('spendwise-session', JSON.stringify(session))
  else localStorage.removeItem('spendwise-session')
}

export async function apiRequest(path, options = {}) {
  const session = getSession()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || body.message || `Request failed (${response.status})`)
  return body
}

export function authenticate(mode, values) {
  return apiRequest(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(values) })
}
