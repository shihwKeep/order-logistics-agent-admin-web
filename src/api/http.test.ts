import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, clearSecurityContext } from './http'

describe('secure API client', () => {
  beforeEach(() => clearSecurityContext())

  it('uses HttpOnly-cookie credentials and CSRF without bearer tokens', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'SUCCESS', message: 'success', data: { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }, timestamp: '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'SUCCESS', message: 'success', data: { id: 1 }, timestamp: '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await apiRequest('/api/v1/admin/tenants/1/knowledge-bases', {
      method: 'POST', body: JSON.stringify({ name: '售后规则' }),
    })

    const [, request] = fetchMock.mock.calls[1]
    const headers = new Headers(request?.headers)
    expect(request?.credentials).toBe('include')
    expect(headers.get('X-XSRF-TOKEN')).toBe('csrf-token')
    expect(headers.get('X-Request-Id')).toBeTruthy()
    expect(headers.has('Authorization')).toBe(false)
  })
})
