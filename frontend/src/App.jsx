import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getRecommendations, getAllRecommendations, postDecision,
  getActivityLog, getActivityLogStats,
  getDashboardKPIs, getFleetAnalytics,
  getAutonomy, setAutonomy as setAutonomyApi,
  generateIncident,
} from './api'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import RecommendationDetail from './components/RecommendationDetail'
import ReviewCenter from './components/ReviewCenter'
import ActivityLog from './components/ActivityLog'
import IncidentReport from './components/IncidentReport'
import DecisionModal from './components/DecisionModal'
import './index.css'
import './timeline.css'

// Sentinel to distinguish "fetch failed" from "API returned empty"
const FETCH_FAILED = Symbol('FETCH_FAILED')

export default function App() {
  // Navigation
  const [view, setView] = useState('dashboard')
  const [activeRecId, setActiveRecId] = useState(null)
  const [incidentData, setIncidentData] = useState(null)

  // Settings
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Data
  const [recs, setRecs] = useState([])
  const [allRecs, setAllRecs] = useState([])
  const [kpis, setKpis] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [logData, setLogData] = useState({ all: [] })
  const [logStats, setLogStats] = useState(null)
  const [autonomy, setAutonomy] = useState({ mode: 'always_ask', label: 'Always Ask' })

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiConnected, setApiConnected] = useState(true)
  const [decisionModal, setDecisionModal] = useState(null)
  const hasLoadedOnce = useRef(false)

  // Filters for activity log
  const [logFilters, setLogFilters] = useState({})

  const refresh = useCallback(async () => {
    // Only show the full-screen loading spinner on the very first load
    if (!hasLoadedOnce.current) {
      setLoading(true)
    }
    try {
      // Use FETCH_FAILED sentinel so we can tell "API down" from "API returned empty"
      const [r, ar, k, a, l, ls, au] = await Promise.all([
        getRecommendations().catch(() => FETCH_FAILED),
        getAllRecommendations().catch(() => FETCH_FAILED),
        getDashboardKPIs().catch(() => FETCH_FAILED),
        getFleetAnalytics().catch(() => FETCH_FAILED),
        getActivityLog(logFilters).catch(() => FETCH_FAILED),
        getActivityLogStats().catch(() => FETCH_FAILED),
        getAutonomy().catch(() => FETCH_FAILED),
      ])

      // Check if ALL calls failed (API is completely unreachable)
      const allFailed = [r, ar, k, a, l, ls, au].every(v => v === FETCH_FAILED)

      if (allFailed) {
        // API is down — keep existing data, show error
        setApiConnected(false)
        setError('Cannot reach the API server. Make sure uvicorn is running on port 8000.')
      } else {
        // At least some calls succeeded — update only the ones that worked
        setApiConnected(true)
        setError(null)
        if (r !== FETCH_FAILED) setRecs(r)
        if (ar !== FETCH_FAILED) setAllRecs(ar)
        if (k !== FETCH_FAILED) setKpis(k)
        if (a !== FETCH_FAILED) setAnalytics(a)
        if (l !== FETCH_FAILED) setLogData(l)
        if (ls !== FETCH_FAILED) setLogStats(ls)
        if (au !== FETCH_FAILED) setAutonomy(au)
        hasLoadedOnce.current = true
      }
    } catch (e) {
      setApiConnected(false)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [logFilters])

  // Initial load + re-fetch when filters change
  useEffect(() => { refresh() }, [refresh])

  // Auto-retry every 10 seconds when the API is disconnected
  useEffect(() => {
    if (!apiConnected) {
      const timer = setInterval(refresh, 10_000)
      return () => clearInterval(timer)
    }
  }, [apiConnected, refresh])

  async function handleDecision(id, decision, note) {
    try {
      await postDecision(id, decision, note)
      setDecisionModal(null)
      await refresh()
      if (view === 'detail') setView('dashboard')
    } catch (e) {
      setError(e.message)
    }
  }

  function openDecisionModal(id, decision) {
    setDecisionModal({ id, decision })
  }

  async function handleAutonomyChange(mode) {
    try {
      const result = await setAutonomyApi(mode)
      setAutonomy(result)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleGenerateIncident(recId) {
    try {
      const report = await generateIncident(recId)
      setIncidentData(report)
      setView('incident')
    } catch (e) {
      setError(e.message)
    }
  }

  function openDetail(id) {
    setActiveRecId(id)
    setView('detail')
  }

  const activeRec = allRecs.find((r) => r.id === activeRecId)

  const viewTitles = {
    dashboard: 'AI Operations Dashboard',
    detail: 'Recommendation Detail',
    review: 'Human Review Center',
    log: 'Activity Log & Audit Trail',
    incident: 'AI Incident Report',
    settings: 'Console Settings',
  }

  return (
    <div className="app-layout">
      <Sidebar view={view} onNavigate={setView} pendingCount={recs.length} />

      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <h1 className="topbar-title">{viewTitles[view] || 'Trust-AI Console'}</h1>
          <div className="topbar-actions">
            <div className="autonomy-dial" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="info-icon" style={{ marginRight: 12 }}>
                ?
                <span className="info-tooltip">
                  <strong>Autonomy Level</strong><br/>
                  Controls whether the Remediation Agent requires human approval before executing actions.
                </span>
              </span>
              {[
                { key: 'always_ask', label: 'Always Ask' },
                { key: 'recommend_only', label: 'Recommend' },
                { key: 'act_and_notify', label: 'Act & Notify' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  className={`autonomy-option ${autonomy.mode === opt.key ? 'active' : ''}`}
                  onClick={() => handleAutonomyChange(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Error bar */}
        {error && (
          <div style={{ padding: '12px 32px', background: 'var(--accent-rose-dim)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent-rose)' }}>
              ⚠ {error} — Make sure the API is running (<code>uvicorn api:app --port 8000</code>)
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading intelligence data…</span>
          </div>
        )}

        {/* ── Screen 1: Dashboard ─────────────────────────────── */}
        {!loading && view === 'dashboard' && (
          <Dashboard
            kpis={kpis}
            analytics={analytics}
            recs={recs}
            autonomy={autonomy}
            onOpenDetail={openDetail}
            onDecision={openDecisionModal}
          />
        )}

        {/* ── Screen 2: Recommendation Detail ─────────────────── */}
        {!loading && view === 'detail' && activeRec && (
          <RecommendationDetail
            rec={activeRec}
            onBack={() => setView('dashboard')}
            onDecision={openDecisionModal}
            onGenerateIncident={handleGenerateIncident}
          />
        )}

        {/* ── Screen 3: Human Review Center ───────────────────── */}
        {!loading && view === 'review' && (
          <ReviewCenter
            recs={allRecs}
            logData={logData}
            onOpenDetail={openDetail}
            onDecision={openDecisionModal}
            onGenerateIncident={handleGenerateIncident}
          />
        )}

        {/* ── Screen 4: Activity Log ──────────────────────────── */}
        {!loading && view === 'log' && (
          <ActivityLog
            logData={logData}
            logStats={logStats}
            filters={logFilters}
            onFiltersChange={(f) => setLogFilters(f)}
          />
        )}

        {/* ── Screen 5: Incident Report ───────────────────────── */}
        {!loading && view === 'incident' && incidentData && (
          <IncidentReport
            report={incidentData}
            onBack={() => setView('review')}
          />
        )}

        {/* ── Screen 6: Settings ──────────────────────────────── */}
        {!loading && view === 'settings' && (
          <div className="page animate-in">
            <h2 className="section-title">Console Settings</h2>
            <div className="glass-card" style={{ maxWidth: 600 }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 8 }}>Interface Theme</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Choose your preferred color theme. Dark mode is easier on the eyes for prolonged use in operations centers.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
                    Dark Mode
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} />
                    Light Mode
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {decisionModal && (
        <DecisionModal
          recId={decisionModal.id}
          decision={decisionModal.decision}
          rec={allRecs.find((r) => r.id === decisionModal.id)}
          onConfirm={handleDecision}
          onCancel={() => setDecisionModal(null)}
        />
      )}
    </div>
  )
}
