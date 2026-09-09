import type { ApiEnvelope } from './types'

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

interface CsrfState {
  token: string
  headerName: string
}

let csrf: CsrfState | null = null

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function requestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const body = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || body.code !== 'SUCCESS') {
    if (response.status === 401) window.dispatchEvent(new CustomEvent('knowledge-auth-expired'))
    throw new ApiError(body.code || 'HTTP_ERROR', body.message || '请求失败', response.status)
  }
  return body
}

export async function ensureCsrf(force = false): Promise<CsrfState> {
  if (csrf && !force) return csrf
  const response = await fetch('/api/v1/admin/auth/csrf', { credentials: 'include' })
  const body = await parseEnvelope<CsrfState>(response)
  csrf = body.data
  return csrf
}

export function clearSecurityContext(): void {
  csrf = null
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (mutationMethods.has(method)) {
    const currentCsrf = await ensureCsrf()
    headers.set(currentCsrf.headerName, currentCsrf.token)
    headers.set('X-Request-Id', requestId())
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(path, { ...init, method, headers, credentials: 'include' })
  return (await parseEnvelope<T>(response)).data
}

export const jsonBody = (value: unknown): string => JSON.stringify(value)

export const __testing = {
  csrf: () => csrf,
}
