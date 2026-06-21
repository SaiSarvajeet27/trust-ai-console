// All calls to the FastAPI backend live here.
// In dev mode Vite proxies /api/* to the FastAPI backend (see vite.config.ts).
// VITE_API_BASE can still be set to override (e.g. for production builds).
const BASE = import.meta.env.VITE_API_BASE || ''

async function asJson(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

// ── Recommendations ──────────────────────────────────────────────
export async function getRecommendations() {
  return asJson(await fetch(`${BASE}/api/recommendations`))
}

export async function getAllRecommendations() {
  return asJson(await fetch(`${BASE}/api/recommendations/all`))
}

export async function getRecommendation(id) {
  return asJson(await fetch(`${BASE}/api/recommendations/${id}`))
}

export async function postDecision(id, decision, note = '') {
  return asJson(
    await fetch(`${BASE}/api/recommendations/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note }),
    }),
  )
}

// ── Activity Log ─────────────────────────────────────────────────
export async function getActivityLog(params = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.category) q.set('category', params.category)
  if (params.decision) q.set('decision', params.decision)
  if (params.priority) q.set('priority', params.priority)
  const qs = q.toString()
  return asJson(await fetch(`${BASE}/api/activity-log${qs ? '?' + qs : ''}`))
}

export async function getActivityLogStats() {
  return asJson(await fetch(`${BASE}/api/activity-log/stats`))
}

// ── Fleet ────────────────────────────────────────────────────────
export async function getFleetSummary() {
  return asJson(await fetch(`${BASE}/api/fleet/summary`))
}

export async function getFleetAnalytics() {
  return asJson(await fetch(`${BASE}/api/fleet/analytics`))
}

// ── Dashboard KPIs ───────────────────────────────────────────────
export async function getDashboardKPIs() {
  return asJson(await fetch(`${BASE}/api/dashboard/kpis`))
}

// ── Autonomy ─────────────────────────────────────────────────────
export async function getAutonomy() {
  return asJson(await fetch(`${BASE}/api/settings/autonomy`))
}

export async function setAutonomy(mode) {
  return asJson(
    await fetch(`${BASE}/api/settings/autonomy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    }),
  )
}

// ── Incidents ────────────────────────────────────────────────────
export async function generateIncident(recId) {
  return asJson(
    await fetch(`${BASE}/api/incidents/generate/${recId}`, { method: 'POST' }),
  )
}

export async function getIncident(id) {
  return asJson(await fetch(`${BASE}/api/incidents/${id}`))
}

export async function listIncidents() {
  return asJson(await fetch(`${BASE}/api/incidents`))
}
