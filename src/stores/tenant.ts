import { defineStore } from 'pinia'
import { computed } from 'vue'

export const DEFAULT_TENANT_ID = 1
export const DEFAULT_TENANT_NAME = '享佳健康'

export const useTenantStore = defineStore('tenant', () => {
  const targetTenantId = computed(() => DEFAULT_TENANT_ID)
  const targetTenantName = computed(() => DEFAULT_TENANT_NAME)
  const requiresSelection = computed(() => false)

  return { targetTenantId, targetTenantName, requiresSelection }
})
