import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import AdminLayout from './AdminLayout.vue'
import { useAuthStore } from '../stores/auth'

describe('AdminLayout tenant context', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('opens the available tenant dropdown from the switch button for a multi-role super admin', async () => {
    const auth = useAuthStore()
    auth.identity = {
      userId: 1,
      account: '74680',
      displayName: '石海文',
      tenantId: 1,
      roles: ['KNOWLEDGE_ADMIN', 'KNOWLEDGE_SUPER_ADMIN'],
    }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div>管理台首页</div>' } }],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AdminLayout, {
      global: { plugins: [router], stubs: { teleport: true } },
    })

    expect(wrapper.text()).toContain('管理台首页')
    expect(wrapper.text()).toContain('享佳健康')
    expect(wrapper.text()).not.toContain('请选择目标租户')
    expect(wrapper.get('aside .brand img.brand-logo').attributes('src')).toBe('/knowledge-logo.png')
    expect(wrapper.find('aside .brand-mark').exists()).toBe(false)

    await wrapper.get('button.tenant-chip').trigger('click')

    const dropdown = wrapper.get('.tenant-dropdown')
    const options = dropdown.findAll('button.tenant-option')
    expect(options).toHaveLength(1)
    expect(options[0].text()).toContain('享佳健康')
    expect(options[0].attributes('aria-current')).toBe('true')
    expect(wrapper.find('form.tenant-switcher').exists()).toBe(false)
  })
})
