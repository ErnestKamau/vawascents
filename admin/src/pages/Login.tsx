import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Login() {
  const { user, login, error } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await login(identifier, password)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h1 className="mb-1 text-xl font-semibold">VawaScents Admin</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Sign in to manage the store.</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">Email or phone</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
