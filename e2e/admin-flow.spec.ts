import { expect, test, type Page } from '@playwright/test'

async function mockApi(page: Page, roles: string[] = ['KNOWLEDGE_ADMIN']) {
  let loggedIn = false
  await page.route('**/api/v1/admin/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const success = (data: unknown) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'SUCCESS', message: 'success', data, timestamp: new Date().toISOString() }),
    })
    if (url.pathname.endsWith('/auth/csrf')) return success({ token: 'csrf', headerName: 'X-XSRF-TOKEN', parameterName: '_csrf' })
    if (url.pathname.endsWith('/auth/login')) { loggedIn = true; return success({ userId: 1, account: '74680', displayName: '石海文', tenantId: 1, roles }) }
    if (url.pathname.endsWith('/auth/me')) {
      if (loggedIn) return success({ userId: 1, account: '74680', displayName: '石海文', tenantId: 1, roles })
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'AUTH_REQUIRED', message: '请先登录', data: null, timestamp: '' }) })
    }
    if (url.pathname.endsWith('/knowledge-bases')) return success([
      { id: 2, tenantId: 1, name: '售后规则', description: '退款与换货政策', status: 'ENABLED', rowVersion: 0, createdAt: '2026-09-09T10:00:00+08:00', updatedAt: '2026-09-09T10:00:00+08:00' },
    ])
    return success(null)
  })
}

test('管理员通过快快外卖登录并进入知识库工作台', async ({ page }) => {
  await mockApi(page)
  await page.goto('/login')
  await page.getByPlaceholder('请输入账号或工号').fill('74680')
  await page.getByPlaceholder('请输入密码').fill('secret')
  await page.getByRole('button', { name: '安全登录' }).click()
  await expect(page.getByRole('heading', { name: '把复杂规则，沉淀为坐席可用的答案。' })).toBeVisible()
  await expect(page.getByText('售后规则')).toBeVisible()
})

test('超级管理员必须显式选择目标租户', async ({ page }) => {
  await mockApi(page, ['KNOWLEDGE_SUPER_ADMIN'])
  await page.goto('/login')
  await page.getByPlaceholder('请输入账号或工号').fill('root')
  await page.getByPlaceholder('请输入密码').fill('secret')
  await page.getByRole('button', { name: '安全登录' }).click()
  await expect(page.getByRole('heading', { name: '请选择目标租户' })).toBeVisible()
  await page.getByPlaceholder('例如：1').fill('9')
  await page.getByRole('button', { name: '进入租户空间' }).click()
  await expect(page.getByText('租户 9')).toBeVisible()
})
