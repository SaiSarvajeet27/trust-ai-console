// All calls to the FastAPI backend live here.
// Override the base URL with a .env file: VITE_API_BASE=http://localhost:8000
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function asJson(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

export async function getRecommendations() {
  return asJson(await fetch(`${BASE}/api/recommendations`))
}

export async function getActivityLog() {
  return asJson(await fetch(`${BASE}/api/activity-log`))
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
