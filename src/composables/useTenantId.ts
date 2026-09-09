import { computed } from 'vue'
import { useTenantStore } from '../stores/tenant'

export function useTenantId() {
  const tenant = useTenantStore()
  return computed(() => {
    if (!tenant.targetTenantId) throw new Error('尚未选择目标租户')
    return tenant.targetTenantId
  })
}
