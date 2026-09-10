import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import AdminLayout from './AdminLayout.vue'
import { useAuthStore } from '../stores/auth'

describe('AdminLayout tenant context', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('enters tenant 1 directly and displays 享佳健康 without tenant selection', async () => {
    const auth = useAuthStore()
    auth.identity = {
      userId: 1,
      account: 'root',
      displayName: '超级管理员',
      tenantId: 1,
      roles: ['KNOWLEDGE_SUPER_ADMIN'],
    }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: AdminLayout,
          children: [{ path: '', component: { template: '<div>管理台首页</div>' } }],
        },
      ],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AdminLayout, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('管理台首页')
    expect(wrapper.text()).toContain('享佳健康')
    expect(wrapper.text()).not.toContain('请选择目标租户')
    expect(wrapper.text()).not.toContain('切换')
  })
})
