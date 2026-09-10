import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginView from './LoginView.vue'
import { knowledgeApi } from '../api/knowledge'

describe('LoginView', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('does not render redundant authentication helper copy', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/login', component: LoginView }],
    })
    await router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    expect(wrapper.text()).not.toContain('快快外卖 · 统一身份认证')
    expect(wrapper.text()).not.toContain('使用您在快快外卖应用中的管理员账号。')
    expect(wrapper.text()).not.toContain('会话仅保存在 HttpOnly Cookie 中，浏览器不会保存访问令牌。')
  })

  it('authenticates through the service and never renders token inputs', async () => {
    vi.spyOn(knowledgeApi, 'login').mockResolvedValue({
      userId: 1, account: '74680', displayName: '石海文', tenantId: 1, roles: ['KNOWLEDGE_ADMIN'],
    })
    const router = createRouter({
      history: createMemoryHistory(), routes: [{ path: '/login', component: LoginView }, { path: '/', component: { template: '<div>home</div>' } }],
    })
    await router.push('/login'); await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router] } })
    await wrapper.get('input[autocomplete="username"]').setValue('74680')
    await wrapper.get('input[type="password"]').setValue('secret')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(wrapper.find('input[name="token"]').exists()).toBe(false)
  })
})
