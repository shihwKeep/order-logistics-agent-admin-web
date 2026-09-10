import { createPinia, setActivePinia } from 'pinia'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
    expect(wrapper.text()).not.toContain('统一管理商品、订单、物流与售后规则，构建可发布、可回滚、可追溯的企业知识。')
  })

  it('describes reliable knowledge Q&A in the hero title', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/login', component: LoginView }],
    })
    await router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    expect(wrapper.get('h1').text()).toBe('让每一次知识问答，都有可靠依据。')
    expect(wrapper.get('h1').text()).not.toContain('坐席回答')
  })

  it('uses the supplied knowledge logo for the login brand and browser tab', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/login', component: LoginView }],
    })
    await router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })
    const indexHtml = readFileSync(resolve('index.html'), 'utf8')

    expect(wrapper.get('img.brand-logo').attributes('src')).toBe('/knowledge-logo.png')
    expect(indexHtml).toContain('<link rel="icon" type="image/png" href="/knowledge-logo.png"')
    expect(existsSync(resolve('public/knowledge-logo.png'))).toBe(true)
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

  it('toggles password visibility without changing its value', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/login', component: LoginView }],
    })
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router] } })
    const passwordInput = wrapper.get('input[autocomplete="current-password"]')

    await passwordInput.setValue('secret')
    expect(passwordInput.attributes('type')).toBe('password')

    await wrapper.get('button[aria-label="显示密码"]').trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')
    expect((passwordInput.element as HTMLInputElement).value).toBe('secret')

    await wrapper.get('button[aria-label="隐藏密码"]').trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
    expect((passwordInput.element as HTMLInputElement).value).toBe('secret')
  })
})
