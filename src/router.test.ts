import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { installAuthExpiryRedirect } from './router'

describe('auth expiry navigation', () => {
  it('immediately replaces a protected page with login', async () => {
    const events = new EventTarget()
    const testRouter = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
        { path: '/documents', name: 'documents', component: { template: '<div>sensitive</div>' } },
      ],
    })
    await testRouter.push('/documents')
    await testRouter.isReady()
    installAuthExpiryRedirect(testRouter, events)

    events.dispatchEvent(new Event('knowledge-auth-expired'))

    await vi.waitFor(() => expect(testRouter.currentRoute.value.name).toBe('login'))
    expect(testRouter.currentRoute.value.query.reason).toBe('expired')
  })
})
