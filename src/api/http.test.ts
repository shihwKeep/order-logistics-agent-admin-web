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

  it('refreshes an expired CSRF token and retries a mutation once', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'SUCCESS', message: 'success', data: { token: 'expired-token', headerName: 'X-XSRF-TOKEN' }, timestamp: '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'CSRF_INVALID', message: '请求校验已失效，请重试', data: null, timestamp: '',
    }), { status: 403, headers: { 'Content-Type': 'application/json' } }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'SUCCESS', message: 'success', data: { token: 'fresh-token', headerName: 'X-XSRF-TOKEN' }, timestamp: '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      code: 'SUCCESS', message: 'success', data: { id: 1 }, timestamp: '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await apiRequest('/api/v1/admin/tenants/1/knowledge-bases/10/documents', {
      method: 'POST', body: new FormData(),
    })

    expect(fetchMock).toHaveBeenCalledTimes(4)
    const [, retriedRequest] = fetchMock.mock.calls[3]
    expect(new Headers(retriedRequest?.headers).get('X-XSRF-TOKEN')).toBe('fresh-token')
  })
})
