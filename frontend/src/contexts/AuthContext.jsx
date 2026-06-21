import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

const BASE = import.meta.env.VITE_API_BASE || ''
const TOKEN_KEY = 'trust_ai_token'
const USER_KEY = 'trust_ai_user'

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed')
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    // Verify token with backend
    fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token invalid')
        return res.json()
      })
      .then((userData) => {
        setUser(userData)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
      })
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  function saveAuth(data) {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
  }

  async function login(email, password) {
    setError(null)
    try {
      const data = await authFetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      saveAuth(data)
      return data.user
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  async function signup(email, password, name) {
    setError(null)
    try {
      const data = await authFetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      })
      saveAuth(data)
      return data.user
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  async function loginWithGoogle(credential) {
    setError(null)
    try {
      const data = await authFetch(`${BASE}/api/auth/google`, {
        method: 'POST',
        body: JSON.stringify({ credential }),
      })
      saveAuth(data)
      return data.user
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setError(null)
  }

  function clearError() {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
