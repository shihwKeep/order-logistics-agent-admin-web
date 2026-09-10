import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from './auth'

export const DEFAULT_TENANT_ID = 1
export const DEFAULT_TENANT_NAME = '享佳健康'

export const useTenantStore = defineStore('tenant', () => {
  const auth = useAuthStore()
  const selectedTenantId = ref(DEFAULT_TENANT_ID)
  const targetTenantId = computed(() =>
    auth.isSuperAdmin ? selectedTenantId.value : (auth.identity?.tenantId ?? DEFAULT_TENANT_ID),
  )
  const targetTenantName = computed(() =>
    targetTenantId.value === DEFAULT_TENANT_ID ? DEFAULT_TENANT_NAME : `租户 ${targetTenantId.value}`,
  )
  const availableTenants = computed(() => [
    { id: DEFAULT_TENANT_ID, name: DEFAULT_TENANT_NAME },
  ])
  const requiresSelection = computed(() => false)

  function select(value: number) {
    if (!auth.isSuperAdmin) throw new Error('仅超级管理员可以切换租户')
    if (!Number.isInteger(value) || value <= 0) throw new Error('租户 ID 必须是正整数')
    selectedTenantId.value = value
  }

  watch(
    () => auth.identity?.userId,
    () => {
      selectedTenantId.value = DEFAULT_TENANT_ID
    },
  )

  return { selectedTenantId, targetTenantId, targetTenantName, availableTenants, requiresSelection, select }
})
