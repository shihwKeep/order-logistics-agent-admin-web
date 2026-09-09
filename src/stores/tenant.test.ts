import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth'
import { useTenantStore } from './tenant'

describe('tenant context', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('pins normal admins to their identity tenant', () => {
    const auth = useAuthStore()
    auth.identity = { userId: 1, account: 'admin', displayName: '管理员', tenantId: 7, roles: ['KNOWLEDGE_ADMIN'] }
    const tenant = useTenantStore()
    expect(tenant.targetTenantId).toBe(7)
    expect(tenant.requiresSelection).toBe(false)
  })

  it('requires an explicit target for super admins', () => {
    const auth = useAuthStore()
    auth.identity = { userId: 1, account: 'root', displayName: '超管', tenantId: 1, roles: ['KNOWLEDGE_SUPER_ADMIN'] }
    const tenant = useTenantStore()
    expect(tenant.requiresSelection).toBe(true)
    tenant.select(9)
    expect(tenant.targetTenantId).toBe(9)
  })
})
