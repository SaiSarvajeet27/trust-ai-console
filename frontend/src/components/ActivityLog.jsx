import { useState, useEffect } from 'react'

const DECISION_STYLES = {
  approved: 'timeline-dot--approved',
  overridden: 'timeline-dot--overridden',
  escalated: 'timeline-dot--escalated',
  dismissed: 'timeline-dot--dismissed',
  pending: 'timeline-dot--pending',
  Approved: 'timeline-dot--approved',
  Overridden: 'timeline-dot--overridden',
  Escalated: 'timeline-dot--escalated',
  Dismissed: 'timeline-dot--dismissed',
  Pending: 'timeline-dot--pending',
}

export default function ActivityLog({ logData, logStats, filters, onFiltersChange }) {
  const [search, setSearch] = useState(filters.search || '')
  const [catFilter, setCatFilter] = useState(filters.category || '')
  const [decFilter, setDecFilter] = useState(filters.decision || '')

  useEffect(() => {
    const t = setTimeout(() => {
      if (
        filters.search !== search ||
        filters.category !== catFilter ||
        filters.decision !== decFilter
      ) {
        onFiltersChange({ search, category: catFilter, decision: decFilter })
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search, catFilter, decFilter, filters, onFiltersChange])

  const entries = logData?.all || []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Activity Log & Audit Trail</h1>
        <p className="page-subtitle">Complete record of AI recommendations and human decisions for compliance and review.</p>
      </div>

      {/* Stats Strip */}
      {logStats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div className="glass-card" style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{logStats.total}</div>
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approval Rate</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{logStats.approval_rate}%</div>
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{logStats.approved}</div>
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escalated</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-rose)' }}>{logStats.escalated}</div>
          </div>
          <div className="glass-card" style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overridden</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-amber)' }}>{logStats.overridden}</div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="search-bar" style={{ marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search actions, notes, or recommendations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 24 }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center', marginRight: 4 }}>Category:</span>
        {['', 'security', 'compliance', 'maintenance', 'access'].map((c) => (
          <button
            key={c}
            className={`filter-chip ${catFilter === c ? 'active' : ''}`}
            onClick={() => setCatFilter(c)}
          >
            {c || 'All'}
          </button>
        ))}

        <span style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center', marginLeft: 12, marginRight: 4 }}>Decision:</span>
        {['', 'Approved', 'Overridden', 'Escalated', 'Dismissed', 'Pending'].map((d) => (
          <button
            key={d}
            className={`filter-chip ${decFilter === d ? 'active' : ''}`}
            onClick={() => setDecFilter(d)}
          >
            {d || 'All'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="timeline">
        {entries.map((e, i) => (
          <div key={e.id || i} className={`timeline-item animate-in`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className={`timeline-dot ${DECISION_STYLES[e.human_decision] || 'timeline-dot--pending'}`} />
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="timeline-time">{e.timestamp}</div>
                  <div className="timeline-action">{e.action}</div>
                  <div className="timeline-detail">
                    {e.ai_recommendation} — {e.target_summary}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className={`timeline-decision timeline-decision--${(e.human_decision || '').toLowerCase()}`}>
                    {e.human_decision}
                  </span>
                  {e.decided_by && e.decided_by !== '—' && (
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>by {e.decided_by}</span>
                  )}
                </div>
              </div>
              {e.note && (
                <div style={{ marginTop: 8, padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: 6, fontSize: '12px', color: 'var(--text-muted)' }}>
                  📝 {e.note}
                </div>
              )}
              {(e.confidence_band || e.category || e.priority) && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {e.priority && <span className={`priority-badge priority-badge--${e.priority}`}>{e.priority}</span>}
                  {e.category && <span className="category-badge">{e.category}</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="empty-state">
            <p>No activity matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
