import ConfidenceBadge from './ConfidenceBadge'

const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export default function ReviewCenter({ recs, logData, onOpenDetail, onDecision, onGenerateIncident }) {
  const pending = recs.filter((r) => r.status === 'pending')
  const decided = logData?.all || []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Human Review Center</h1>
        <p className="page-subtitle">Review, approve, or escalate AI recommendations. Your decisions are logged for audit compliance.</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div className="glass-card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-amber)' }}>{pending.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
        </div>
        <div className="glass-card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {decided.filter((r) => r.human_decision === 'Approved').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</div>
        </div>
        <div className="glass-card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-rose)' }}>
            {decided.filter((r) => r.human_decision === 'Escalated').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escalated</div>
        </div>
        <div className="glass-card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-secondary)' }}>
            {decided.filter((r) => r.human_decision === 'Overridden').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overridden</div>
        </div>
      </div>

      {/* Pending Queue */}
      <h2 className="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Pending Review Queue
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {pending.map((r, i) => (
          <div key={r.id} className={`rec-card rec-card--${r.priority || 'medium'} animate-in`} style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className={`priority-badge priority-badge--${r.priority}`}>{PRIORITY_LABELS[r.priority]}</span>
                  <span className="category-badge">{r.category}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => onOpenDetail(r.id)}>
                  {r.action}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{r.target_summary}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{r.reasoning_steps?.[0]}</p>

                {/* Historical precedent one-liner */}
                {r.historical_precedent && (
                  <div style={{
                    marginTop: 8, padding: '6px 12px', borderRadius: 8,
                    background: 'var(--accent-blue-dim)', fontSize: '11px', color: 'var(--accent-blue-light)',
                    borderLeft: '2px solid var(--accent-blue)',
                  }}>
                    🕐 {r.historical_precedent.similar_alerts} similar past alerts — {r.historical_precedent.summary?.split('.')[0]}.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <ConfidenceBadge band={r.confidence_band} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={() => onDecision(r.id, 'approved')}>Approve</button>
                  <button className="btn btn-warning btn-sm" onClick={() => onDecision(r.id, 'overridden')}>Override</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDecision(r.id, 'escalated')}>Escalate</button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onOpenDetail(r.id)} style={{ fontSize: '11px' }}>
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="empty-state">
            <p>✅ No pending recommendations — all caught up!</p>
          </div>
        )}
      </div>

      {/* Decided Items */}
      {decided.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 32 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
            Recently Decided
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {decided.slice(0, 5).map((r, i) => (
              <div key={r.id || i} className="glass-card" style={{ padding: '14px 20px', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{r.action}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 10 }}>{r.target_summary}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`timeline-decision timeline-decision--${(r.human_decision || '').toLowerCase()}`}>{r.human_decision}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
