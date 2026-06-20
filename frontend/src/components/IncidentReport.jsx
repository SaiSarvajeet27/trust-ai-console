import { useRef } from 'react'

export default function IncidentReport({ report, onBack }) {
  const contentRef = useRef()

  const handlePrint = () => {
    window.print()
  }

  const SEVERITY_COLORS = {
    critical: 'var(--accent-rose)',
    high: 'var(--accent-amber)',
    medium: 'var(--accent-blue)',
    low: 'var(--accent-emerald)',
  }

  const sevColor = SEVERITY_COLORS[report.severity] || 'var(--text-secondary)'

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <button className="back-link" onClick={onBack} style={{ display: 'inline-flex' }} id="hide-print">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        Back to Reviews
      </button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }} id="hide-print">
        <button className="btn btn-ghost" onClick={handlePrint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Export / Print Report
        </button>
      </div>

      <div ref={contentRef} className="animate-in" style={{ background: '#ffffff', color: '#111827', padding: '40px 48px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: 4 }}>
                AI Action Incident Report
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>{report.title}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Report ID</div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{report.id}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Generated At</div>
              <div style={{ fontSize: 14 }}>{report.generated_at}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Severity</div>
              <div style={{ fontWeight: 700, color: sevColor, textTransform: 'capitalize' }}>{report.severity}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Final Status</div>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{report.status}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Target Scope</div>
              <div style={{ fontWeight: 600 }}>{report.what_happened.target}</div>
            </div>
          </div>
        </div>

        {/* 1. What Happened */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>
            1. Event Summary
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, color: '#374151' }}>
            <strong>Action Recommended:</strong> {report.what_happened.action}
          </p>
          <div style={{ background: '#f3f4f6', padding: 16, borderRadius: 8, fontSize: 14, color: '#374151' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>AI Reasoning Steps:</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {report.what_happened.reasoning?.map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{step}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Root Cause Analysis */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>
            2. AI Root Cause Analysis
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#374151', marginBottom: 16 }}>
            {report.why_it_happened.root_cause}
          </p>
          {report.why_it_happened.factors?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>Contributing Factors:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {report.why_it_happened.factors.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 0', color: '#374151' }}>{f.factor}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: f.weight === 'major' ? '#111827' : '#6b7280', textTransform: 'capitalize' }}>
                        {f.weight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Action Taken */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>
            3. Action Taken & Impact
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Human Decision</div>
              <div style={{ color: '#111827', textTransform: 'capitalize', fontWeight: 600 }}>{report.what_was_done.decision}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Risk Reduction</div>
              <div style={{ color: '#111827', fontWeight: 600 }}>{report.impact_assessment.risk_reduction}</div>
            </div>
          </div>
        </div>

        {/* 4. Safeguards */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 16 }}>
            4. Recommended Safeguards
          </h2>
          {report.recommended_safeguards?.length > 0 ? (
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              {report.recommended_safeguards.map((sg, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{sg}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>No specific safeguards recommended.</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Generated automatically by Trust-AI Console • {report.id}
        </div>
      </div>
    </div>
  )
}
