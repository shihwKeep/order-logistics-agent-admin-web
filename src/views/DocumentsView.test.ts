import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { knowledgeApi } from '../api/knowledge'
import DocumentsView from './DocumentsView.vue'

describe('DocumentsView navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(knowledgeApi, 'listDocuments').mockResolvedValue([])
  })

  it('uses the shared back button for returning to knowledge bases', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/knowledge-bases/:knowledgeBaseId/documents', component: DocumentsView },
        { path: '/knowledge-bases', component: { template: '<div>知识库</div>' } },
      ],
    })
    await router.push('/knowledge-bases/1/documents')
    await router.isReady()

    const wrapper = mount(DocumentsView, { global: { plugins: [router] } })
    await flushPromises()

    const backButton = wrapper.get('a.back-button')
    expect(backButton.text()).toContain('返回知识库')
    expect(backButton.attributes('href')).toBe('/knowledge-bases')
    expect(backButton.get('.back-button-icon').attributes('aria-hidden')).toBe('true')
  })

  it('shows a localized unknown-version fallback without invented version metrics', async () => {
    vi.mocked(knowledgeApi.listDocuments).mockResolvedValue([{
      id: 2,
      tenantId: 1,
      knowledgeBaseId: 1,
      title: '缺少版本的文档',
      currentDraftVersionId: null,
      currentPublishedVersionId: null,
      rowVersion: 0,
      createdAt: '2026-09-10T16:12:20',
      updatedAt: '2026-09-10T16:12:20',
      versions: [],
    }])
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/knowledge-bases/:knowledgeBaseId/documents', component: DocumentsView },
        { path: '/knowledge-bases', component: { template: '<div>知识库</div>' } },
      ],
    })
    await router.push('/knowledge-bases/1/documents')
    await router.isReady()

    const wrapper = mount(DocumentsView, { global: { plugins: [router] } })
    await flushPromises()

    const card = wrapper.get('.document-card')
    expect(card.text()).toContain('未知版本')
    expect(card.text()).not.toContain('UNKNOWN')
    expect(card.text()).not.toContain('草稿 v—')
    expect(card.text()).not.toContain('0 Chunks')
  })
})
