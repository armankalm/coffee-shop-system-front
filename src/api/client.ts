const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:8080').replace(/\/$/, '')
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${API_ORIGIN}/api`

const STORAGE_KEY = 'drinkit.auth'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

function readAccessToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as { accessToken?: string }
    return session.accessToken ?? null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (auth) {
    const token = readAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : undefined

  if (!response.ok) {
    const message = body?.error ?? body?.message ?? `Request failed with status ${response.status}`
    throw new ApiError(response.status, message)
  }

  return body as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' }, true)
}

export function apiPost<T>(path: string, data?: unknown, auth = false): Promise<T> {
  return request<T>(
    path,
    {
      method: 'POST',
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    },
    auth,
  )
}
