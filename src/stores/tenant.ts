import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from './auth'

export const useTenantStore = defineStore('tenant', () => {
  const auth = useAuthStore()
  const selectedTenantId = ref<number | null>(null)
  const targetTenantId = computed(() =>
    auth.isSuperAdmin ? selectedTenantId.value : (auth.identity?.tenantId ?? null),
  )
  const requiresSelection = computed(() => auth.isSuperAdmin && targetTenantId.value === null)

  function select(value: number) {
    if (!Number.isInteger(value) || value <= 0) throw new Error('租户 ID 必须是正整数')
    selectedTenantId.value = value
  }

  watch(
    () => auth.identity?.userId,
    () => {
      selectedTenantId.value = null
    },
  )
  return { selectedTenantId, targetTenantId, requiresSelection, select }
})
