import { useEffect, useState } from 'react'
import { getRecommendations, getActivityLog, postDecision } from './api'
import RecommendationCard from './components/RecommendationCard'
import RecommendationDetail from './components/RecommendationDetail'
import ActivityLog from './components/ActivityLog'

export default function App() {
  const [recs, setRecs] = useState([])
  const [log, setLog] = useState({ all: [] })
  const [view, setView] = useState('dashboard') // dashboard | detail | log
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      setLoading(true)
      const [r, l] = await Promise.all([getRecommendations(), getActivityLog()])
      setRecs(r)
      setLog(l)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDecision(id, decision) {
    try {
      await postDecision(id, decision)
      await refresh()
      setView('dashboard')
    } catch (e) {
      setError(e.message)
    }
  }

  const active = recs.find((r) => r.id === activeId)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold">Trust-AI Console</h1>
          <nav className="flex gap-4 text-sm">
            <button
              onClick={() => setView('dashboard')}
              className={view === 'dashboard' ? 'font-semibold' : 'text-gray-500'}
            >
              Recommendations
            </button>
            <button
              onClick={() => setView('log')}
              className={view === 'log' ? 'font-semibold' : 'text-gray-500'}
            >
              Activity log
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {loading && <p className="text-gray-500">Loading…</p>}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <br />
            Make sure the API is running (<code>uvicorn api:app --port 8000</code>) and you ran{' '}
            <code>python run_all.py --offline</code>.
          </div>
        )}

        {!loading && !error && view === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recommendations for review</h2>
            {recs.map((r) => (
              <RecommendationCard
                key={r.id}
                rec={r}
                onOpen={(id) => {
                  setActiveId(id)
                  setView('detail')
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && view === 'detail' && active && (
          <RecommendationDetail rec={active} onBack={() => setView('dashboard')} onDecision={handleDecision} />
        )}

        {!loading && !error && view === 'log' && <ActivityLog log={log} />}
      </main>
    </div>
  )
}
