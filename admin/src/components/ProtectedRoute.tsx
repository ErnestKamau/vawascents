import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Layout } from './Layout'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout />
}
