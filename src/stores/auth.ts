import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clearSecurityContext } from '../api/http'
import { knowledgeApi } from '../api/knowledge'
import type { AdminIdentity } from '../api/types'

export const useAuthStore = defineStore('auth', () => {
  const identity = ref<AdminIdentity | null>(null)
  const initialized = ref(false)
  const busy = ref(false)

  const isSuperAdmin = computed(() => identity.value?.roles.includes('KNOWLEDGE_SUPER_ADMIN') ?? false)

  async function restore() {
    try {
      identity.value = await knowledgeApi.me()
    } catch {
      identity.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login(account: string, password: string) {
    busy.value = true
    try {
      clearSecurityContext()
      identity.value = await knowledgeApi.login(account, password)
      initialized.value = true
    } finally {
      busy.value = false
    }
  }

  async function logout() {
    try {
      await knowledgeApi.logout()
    } finally {
      clearSecurityContext()
      identity.value = null
      initialized.value = true
    }
  }

  function expire() {
    clearSecurityContext()
    identity.value = null
    initialized.value = true
  }

  if (typeof window !== 'undefined') window.addEventListener('knowledge-auth-expired', expire)
  return { identity, initialized, busy, isSuperAdmin, restore, login, logout, expire }
})
