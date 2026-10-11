import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiFetch, setAuthToken, getAuthToken, ApiError } from './api'
import type { AdminUser } from './types'

type AuthContextValue = {
  user: AdminUser | null
  loading: boolean
  error: string | null
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadUser() {
    if (!getAuthToken()) {
      setLoading(false)
      return
    }
    try {
      const me = await apiFetch<AdminUser>('/auth/user')
      if (me.role !== 'admin') {
        setAuthToken(null)
        setUser(null)
      } else {
        setUser(me)
      }
    } catch {
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
    const onUnauthorized = () => setUser(null)
    window.addEventListener('admin-unauthorized', onUnauthorized)
    return () => window.removeEventListener('admin-unauthorized', onUnauthorized)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(identifier: string, password: string) {
    setError(null)
    try {
      const result = await apiFetch<{ user: AdminUser; token: string }>('/auth/login', {
        method: 'POST',
        body: { identifier, password },
      })

      if (result.user.role !== 'admin') {
        setError('This account does not have admin access.')
        return
      }

      setAuthToken(result.token)
      setUser(result.user)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed.')
    }
  }

  function logout() {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
