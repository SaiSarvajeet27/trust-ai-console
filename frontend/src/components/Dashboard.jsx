import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import ConfidenceBadge from './ConfidenceBadge'

const HEALTH_COLORS = { healthy: '#10b981', at_risk: '#f59e0b', critical: '#ef4444' }
const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export default function Dashboard({ kpis, analytics, recs, onOpenDetail, onDecision }) {
  const healthData = kpis?.health
    ? Object.entries(kpis.health).map(([k, v]) => ({ name: k, value: v, color: HEALTH_COLORS[k] }))
    : []

  const deptData = analytics?.department_stats || []

  return (
    <div className="page">
      {/* KPI Strip */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card--blue animate-in animate-in-1">
          <div className="kpi-icon kpi-icon--blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div className="kpi-label">Fleet Size</div>
          <div className="kpi-value">{kpis?.fleet_size || 0}</div>
          <div className="kpi-change kpi-change--up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
            Active & monitored
          </div>
        </div>

        <div className="kpi-card kpi-card--amber animate-in animate-in-2">
          <div className="kpi-icon kpi-icon--amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="kpi-label">Active Alerts</div>
          <div className="kpi-value">{kpis?.active_alerts || 0}</div>
          <div className="kpi-change kpi-change--down">
            {kpis?.critical_alerts || 0} critical
          </div>
        </div>

        <div className="kpi-card kpi-card--emerald animate-in animate-in-3">
          <div className="kpi-icon kpi-icon--emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="kpi-label">Trust Score</div>
          <div className="kpi-value">{kpis?.trust_score || 0}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>%</span></div>
          <div className="kpi-change kpi-change--up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
            Based on decision outcomes
          </div>
        </div>

        <div className="kpi-card kpi-card--rose animate-in animate-in-4">
          <div className="kpi-icon kpi-icon--rose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div className="kpi-label">Pending Reviews</div>
          <div className="kpi-value">{kpis?.pending_recommendations || 0}</div>
          <div className="kpi-change">
            Awaiting your decision
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-lg">
        {/* Fleet Health Donut */}
        <div className="chart-wrapper animate-in animate-in-3">
          <div className="chart-header">
            <span className="chart-title" style={{ display: 'flex', alignItems: 'center' }}>
              Fleet Health Distribution
              <span className="info-icon">
                ?
                <span className="info-tooltip">
                  <strong>Fleet Health</strong><br/>
                  Categorizes the entire device fleet into Healthy, At Risk, and Critical based on detected anomalies, patch compliance, and configuration drift.
                </span>
              </span>
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              {healthData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{d.name.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {healthData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Risk Chart */}
        <div className="chart-wrapper animate-in animate-in-4">
          <div className="chart-header">
            <span className="chart-title" style={{ display: 'flex', alignItems: 'center' }}>
              Risk by Department
              <span className="info-icon">
                ?
                <span className="info-tooltip">
                  <strong>Department Risk</strong><br/>
                  Averages the risk score of all devices mapped to a department. Highlights which teams are currently most vulnerable or experiencing active incidents.
                </span>
              </span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} barSize={24}>
              <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="avg_risk" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Risk" />
              <Bar dataKey="critical_count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation Feed */}
      <div className="animate-in animate-in-5">
        <div className="flex-between mb-md">
          <h2 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Recommendations Requiring Action
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{recs.length} pending</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recs.map((r, i) => (
            <div
              key={r.id}
              className={`rec-card rec-card--${r.priority || 'medium'} animate-in`}
              style={{ animationDelay: `${(i + 5) * 50}ms` }}
              onClick={() => onOpenDetail(r.id)}
            >
              <div className="rec-card-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className={`priority-badge priority-badge--${r.priority || 'medium'}`}>
                      {PRIORITY_LABELS[r.priority] || 'Medium'}
                    </span>
                    <span className="category-badge">{r.category || 'security'}</span>
                  </div>
                  <div className="rec-card-title">{r.action}</div>
                  <div className="rec-card-target">{r.target_summary}</div>
                </div>
                <ConfidenceBadge band={r.confidence_band} />
              </div>

              <p className="rec-card-summary">{r.reasoning_steps?.[0]}</p>

              <div className="rec-card-footer">
                <div className="rec-card-meta">
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-2px', marginRight: 4 }}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                    {r.data_sources?.length || 0} sources
                  </span>
                  {r.agent_pipeline?.length > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-2px', marginRight: 4 }}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      {r.agent_pipeline.length} agent steps
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); onDecision(r.id, 'approved') }}>
                    Approve
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onDecision(r.id, 'escalated') }}>
                    Escalate
                  </button>
                </div>
              </div>
            </div>
          ))}

          {recs.length === 0 && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <p>All clear — no pending recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Stats Strip */}
      {analytics && (
        <div className="grid-3 mt-lg animate-in animate-in-6">
          <div className="glass-card">
            <div className="section-title" style={{ fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Encryption Status
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{analytics.encryption_status?.encrypted || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>Encrypted</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-rose)' }}>{analytics.encryption_status?.unencrypted || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-rose)' }}>Unencrypted</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="section-title" style={{ fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              Patch Status
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{analytics.patch_status?.current || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-amber)' }}>{analytics.patch_status?.aging || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aging</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-rose)' }}>{analytics.patch_status?.overdue || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overdue</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="section-title" style={{ fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              Device Models
            </div>
            <div style={{ marginTop: 8 }}>
              {(analytics.model_distribution || []).slice(0, 3).map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.model?.replace('Dell ', '')}</span>
                  <span style={{ fontWeight: 600 }}>{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
