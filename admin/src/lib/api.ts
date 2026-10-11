const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

let authToken: string | null = localStorage.getItem('admin_token')

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('admin_token', token)
  } else {
    localStorage.removeItem('admin_token')
  }
}

export function getAuthToken() {
  return authToken
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (response.status === 401) {
    setAuthToken(null)
    window.dispatchEvent(new Event('admin-unauthorized'))
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? 'Request failed', data?.errors)
  }

  return data as T
}
