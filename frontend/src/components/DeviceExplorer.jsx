import React, { useState, useEffect } from 'react'
import { getDevices } from '../api'

export default function DeviceExplorer() {
  const [devices, setDevices] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [health, setHealth] = useState('')
  
  // Pagination
  const [page, setPage] = useState(1)
  const limit = 15

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * limit
      const data = await getDevices({ search, department, health, limit, offset })
      setDevices(data.devices || [])
      setTotal(data.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [page, department, health]) // Re-fetch on filter change or page change

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1) // Reset to page 1 on search
      fetchDevices()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="device-explorer animate-in">
      <div className="chart-wrapper" style={{ padding: '24px' }}>
        <div className="flex-between mb-lg">
          <div>
            <h2 className="section-title" style={{ marginBottom: '4px' }}>Fleet Devices</h2>
            <p className="section-subtitle">View and monitor all devices in your IT fleet.</p>
          </div>
          <div className="search-bar" style={{ width: '300px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by ID, Model, Owner..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-row mb-lg">
          <select 
            value={department} 
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            style={{ padding: '6px 12px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
          </select>

          <select 
            value={health} 
            onChange={(e) => { setHealth(e.target.value); setPage(1); }}
            style={{ padding: '6px 12px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="at_risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {error ? (
          <div className="empty-state">
            <p style={{ color: 'var(--accent-rose)' }}>Error loading devices: {error}</p>
          </div>
        ) : loading && devices.length === 0 ? (
          <div className="loading-container" style={{ padding: '40px' }}>
            <div className="loading-spinner" />
          </div>
        ) : devices.length === 0 ? (
          <div className="empty-state">
            <p>No devices found matching your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Device ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Model</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Owner</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Risk Score</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Health</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, i) => (
                  <tr key={device.id} style={{ borderBottom: '1px solid var(--border-subtle)', animationDelay: `${i * 30}ms` }} className="animate-in">
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{device.id}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{device.model}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{device.owner}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{device.department}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{device.risk_score}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`timeline-decision timeline-decision--${
                        device.health_status === 'healthy' ? 'approved' : 
                        device.health_status === 'critical' ? 'escalated' : 'overridden'
                      }`}>
                        {device.health_status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!error && totalPages > 1 && (
          <div className="flex-between mt-md" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: page === 1 ? 'var(--bg-elevated)' : 'var(--bg-card)', color: page === 1 ? 'var(--text-dim)' : 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: page === totalPages ? 'var(--bg-elevated)' : 'var(--bg-card)', color: page === totalPages ? 'var(--text-dim)' : 'var(--text-primary)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
