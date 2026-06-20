import { useState } from 'react'
import ConfidenceBadge from './ConfidenceBadge'

const SOURCE_ICONS = {
  telemetry: { cls: 'source-icon--telemetry', icon: '📡' },
  policy: { cls: 'source-icon--policy', icon: '📋' },
  'threat intel': { cls: 'source-icon--threat', icon: '🛡️' },
  'model prediction': { cls: 'source-icon--model', icon: '🤖' },
}

const AGENT_ICONS = {
  'Detection Agent': { cls: 'pipeline-icon--detection', icon: '🔍' },
  'Analysis Agent': { cls: 'pipeline-icon--analysis', icon: '🧠' },
  'Remediation Agent': { cls: 'pipeline-icon--remediation', icon: '🔧' },
}

export default function RecommendationDetail({ rec, onBack, onDecision, onGenerateIncident }) {
  const [activeTab, setActiveTab] = useState('reasoning')

  const tabs = [
    { key: 'reasoning', label: 'Why This?' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'limitations', label: 'Limitations' },
    { key: 'alternatives', label: 'Alternatives' },
    { key: 'pipeline', label: 'Agent Pipeline' },
    { key: 'history', label: 'Trust Time Machine' },
  ]

  return (
    <div className="page">
      {/* Back */}
      <button className="back-link" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="glass-card animate-in" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`priority-badge priority-badge--${rec.priority || 'medium'}`}>
                {rec.priority || 'medium'}
              </span>
              <span className="category-badge">{rec.category || 'security'}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ID: {rec.id}</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 6 }}>{rec.action}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{rec.target_summary}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 8 }}>{rec.confidence_driver}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ConfidenceBadge band={rec.confidence_band} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={() => onDecision(rec.id, 'approved')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
            Approve
          </button>
          <button className="btn btn-warning" onClick={() => onDecision(rec.id, 'overridden')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            Override
          </button>
          <button className="btn btn-danger" onClick={() => onDecision(rec.id, 'escalated')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11l5-5 5 5"/><path d="M7 17l5-5 5 5"/></svg>
            Escalate
          </button>
          <button className="btn btn-ghost" onClick={() => onDecision(rec.id, 'dismissed')}>
            Dismiss
          </button>
          {rec.status !== 'pending' && (
            <button className="btn btn-ghost" onClick={() => onGenerateIncident(rec.id)} style={{ marginLeft: 'auto' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              Generate Incident Report
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs animate-in animate-in-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in animate-in-2">
        {/* ── Why This? ─────────────────────────────────────── */}
        {activeTab === 'reasoning' && (
          <div className="glass-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Why this recommendation was made
            </h3>

            {/* Reasoning Steps as Timeline */}
            <div style={{ paddingLeft: 24, borderLeft: '2px solid var(--accent-blue-dim)', marginBottom: 24 }}>
              {rec.reasoning_steps?.map((step, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                  <div style={{
                    position: 'absolute', left: -31, top: 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--accent-blue-dim)', border: '2px solid var(--accent-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700, color: 'var(--accent-blue)',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Factor Bars */}
            {rec.factors?.length > 0 && (
              <>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Factors that influenced this decision
                </h4>
                {rec.factors.map((f, i) => (
                  <div key={i} className="factor-bar">
                    <div className="factor-bar-header">
                      <span className="factor-bar-label">{f.factor}</span>
                      <span className={`factor-bar-weight factor-bar-weight--${f.weight}`}>{f.weight}</span>
                    </div>
                    <div className="factor-bar-track">
                      <div className={`factor-bar-fill factor-bar-fill--${f.weight}`} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Evidence / Data Sources ───────────────────────── */}
        {activeTab === 'evidence' && (
          <div className="glass-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              Data sources used
            </h3>
            {rec.data_sources?.map((d, i) => {
              const si = SOURCE_ICONS[d.type] || SOURCE_ICONS.telemetry
              return (
                <div key={i} className="source-card">
                  <div className={`source-icon ${si.cls}`}>{si.icon}</div>
                  <div>
                    <div className="source-type">{d.type}</div>
                    <div className="source-desc">{d.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Limitations ──────────────────────────────────── */}
        {activeTab === 'limitations' && (
          <div className="glass-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Known limitations & uncertainties
            </h3>
            {rec.limitations?.length > 0 ? (
              rec.limitations.map((l, i) => (
                <div key={i} className="limitation-card">
                  <p>⚠️ {l}</p>
                </div>
              ))
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                No known limitations for this recommendation. The AI is highly confident in the available data.
              </div>
            )}
          </div>
        )}

        {/* ── Alternatives ─────────────────────────────────── */}
        {activeTab === 'alternatives' && (
          <div className="glass-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12H8m4-4v8"/></svg>
              Alternative actions considered
            </h3>
            {rec.alternatives?.map((a, i) => (
              <div key={i} className="source-card" style={{ marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', flexShrink: 0, fontSize: '14px' }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 4 }}>{a.action}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>Trade-off:</span> {a.tradeoff}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Agent Pipeline ───────────────────────────────── */}
        {activeTab === 'pipeline' && (
          <div className="glass-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Multi-Agent Transparency Pipeline
            </h3>

            {/* Agent Flow Visualization */}
            <div className="pipeline" style={{ marginBottom: 24 }}>
              {['Detection Agent', 'Analysis Agent', 'Remediation Agent'].map((agent, i) => {
                const ai = AGENT_ICONS[agent] || AGENT_ICONS['Detection Agent']
                return (
                  <div key={agent} className="pipeline-step">
                    {i < 2 && (
                      <div className="pipeline-connector">
                        <div className="pipeline-connector-fill" style={{ animationDelay: `${i * 500}ms` }} />
                      </div>
                    )}
                    <div className={`pipeline-icon ${ai.cls}`}>{ai.icon}</div>
                    <div className="pipeline-label">{agent.replace(' Agent', '')}</div>
                  </div>
                )
              })}
            </div>

            {/* Detailed Steps */}
            <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: 20 }}>
              {rec.agent_pipeline?.map((step, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                  <div style={{
                    position: 'absolute', left: -27, top: 2,
                    width: 12, height: 12, borderRadius: '50%',
                    background: step.agent.includes('Detection') ? 'var(--accent-cyan)' :
                               step.agent.includes('Analysis') ? 'var(--accent-purple)' : 'var(--accent-emerald)',
                  }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{step.timestamp}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    <span style={{
                      color: step.agent.includes('Detection') ? 'var(--accent-cyan)' :
                             step.agent.includes('Analysis') ? 'var(--accent-purple)' : 'var(--accent-emerald)',
                    }}>{step.agent}</span>
                    {' → '}{step.action}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{step.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trust Time Machine ───────────────────────────── */}
        {activeTab === 'history' && rec.historical_precedent && (
          <div className="precedent-card">
            <h3 className="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              Trust Time Machine — Historical Precedent
            </h3>

            <div className="precedent-stats">
              <div className="precedent-stat">
                <div className="precedent-stat-value">{rec.historical_precedent.similar_alerts}</div>
                <div className="precedent-stat-label">Similar Alerts</div>
              </div>
              <div className="precedent-stat">
                <div className="precedent-stat-value" style={{ color: 'var(--accent-emerald)' }}>
                  {Object.values(rec.historical_precedent.actions_taken).reduce((a, b) => a + b, 0)}
                </div>
                <div className="precedent-stat-label">Actions Taken</div>
              </div>
              <div className="precedent-stat">
                <div className="precedent-stat-value" style={{ color: 'var(--accent-blue)' }}>
                  {Object.values(rec.historical_precedent.outcomes).reduce((a, b) => a + b, 0)}
                </div>
                <div className="precedent-stat-label">Known Outcomes</div>
              </div>
            </div>

            {/* Actions breakdown */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Actions Previously Taken
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(rec.historical_precedent.actions_taken).map(([action, count]) => (
                  <div key={action} style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}×</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes breakdown */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Outcomes
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(rec.historical_precedent.outcomes).map(([outcome, count]) => (
                  <div key={outcome} style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}×</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="precedent-summary">
              💡 {rec.historical_precedent.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
