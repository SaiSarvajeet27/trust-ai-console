import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage({ onSwitchToLogin }) {
  const { signup, loginWithGoogle, error, clearError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const googleBtnRef = useRef(null)

  // Password strength
  function getStrength(pw) {
    if (!pw) return { level: 0, label: '', cls: '' }
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { level: 1, label: 'Weak', cls: 'weak' }
    if (score <= 2) return { level: 2, label: 'Fair', cls: 'fair' }
    if (score <= 3) return { level: 3, label: 'Good', cls: 'good' }
    return { level: 4, label: 'Strong', cls: 'strong' }
  }

  const strength = getStrength(password)

  // Initialize Google Sign-In
  useEffect(() => {
    if (typeof window.google === 'undefined') return

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: handleGoogleResponse,
    })

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        width: '100%',
        text: 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    }
  }, [])

  async function handleGoogleResponse(response) {
    if (!response.credential) return
    clearError()
    setLocalError('')
    setSubmitting(true)
    try {
      await loginWithGoogle(response.credential)
    } catch {
      // error is set by context
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!name.trim()) return setLocalError('Please enter your name.')
    if (!email.trim()) return setLocalError('Please enter your email.')
    if (password.length < 6) return setLocalError('Password must be at least 6 characters.')
    if (password !== confirm) return setLocalError('Passwords do not match.')

    setSubmitting(true)
    try {
      await signup(email, password, name.trim())
    } catch {
      // error is set by context
    } finally {
      setSubmitting(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />
      <div className="auth-bg-orb auth-bg-orb--3" />

      <div className="auth-container">
        {/* Branding */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="auth-logo-text">Trust-AI</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Get started with the AI Operations Console</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Google Sign Up */}
          <div ref={googleBtnRef} id="google-signup-btn" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />

          {typeof window.google === 'undefined' && (
            <button type="button" className="google-btn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.92.45 3.73 1.18 5.07l3.66-2.84v-.14z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Sign-In requires configuration
            </button>
          )}

          {/* Divider */}
          <div className="auth-divider">
            <span>or create with email</span>
          </div>

          {/* Error */}
          {displayError && (
            <div className="auth-error" id="signup-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icon">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="signup-name"
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="signup-email"
                  type="email"
                  className="auth-input"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="signup-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {password && (
                <div className="password-strength">
                  <div className="password-strength-track">
                    <div className={`password-strength-fill password-strength--${strength.cls}`} style={{ width: `${(strength.level / 4) * 100}%` }} />
                  </div>
                  <span className={`password-strength-label password-strength--${strength.cls}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm" className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-input-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <input
                  id="signup-confirm"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
              id="signup-submit-btn"
            >
              {submitting ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            Already have an account?{' '}
            <button type="button" className="auth-link" onClick={onSwitchToLogin} id="switch-to-login">
              Sign in
            </button>
          </div>
        </div>

        <p className="auth-disclaimer">
          Transparent & Trustworthy AI for Enterprise IT Operations
        </p>
      </div>
    </div>
  )
}
