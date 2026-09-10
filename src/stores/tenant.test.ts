import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth'
import { useTenantStore } from './tenant'

describe('tenant context', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('pins normal admins to tenant 1 享佳健康', () => {
    const auth = useAuthStore()
    auth.identity = { userId: 1, account: 'admin', displayName: '管理员', tenantId: 7, roles: ['KNOWLEDGE_ADMIN'] }
    const tenant = useTenantStore()
    expect(tenant.targetTenantId).toBe(1)
    expect(tenant.targetTenantName).toBe('享佳健康')
    expect(tenant.requiresSelection).toBe(false)
  })

  it('pins super admins to tenant 1 without requiring a selection', () => {
    const auth = useAuthStore()
    auth.identity = { userId: 1, account: 'root', displayName: '超管', tenantId: 1, roles: ['KNOWLEDGE_SUPER_ADMIN'] }
    const tenant = useTenantStore()
    expect(tenant.targetTenantId).toBe(1)
    expect(tenant.targetTenantName).toBe('享佳健康')
    expect(tenant.requiresSelection).toBe(false)
  })
})
