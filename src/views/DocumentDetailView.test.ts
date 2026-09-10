import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { knowledgeApi } from '../api/knowledge'
import DocumentDetailView from './DocumentDetailView.vue'
import '../styles.css'

describe('DocumentDetailView navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(knowledgeApi, 'document').mockResolvedValue({
      id: 2,
      tenantId: 1,
      knowledgeBaseId: 1,
      title: '享佳健康员工手册-2019',
      currentDraftVersionId: 2,
      currentPublishedVersionId: null,
      rowVersion: 0,
      createdAt: '2026-09-10T16:12:20',
      updatedAt: '2026-09-10T16:24:10',
      versions: [{
        id: 2,
        versionNumber: 1,
        status: 'READY',
        originalFilename: '享佳健康员工手册.md',
        mimeType: 'text/markdown',
        fileSize: 12_300,
        ocrRequired: false,
        unitCount: 34,
        chunkCount: 34,
        lastErrorCode: null,
        createdAt: '2026-09-10T16:12:20',
        updatedAt: '2026-09-10T16:24:10',
      }],
    })
    vi.spyOn(knowledgeApi, 'units').mockResolvedValue([])
    vi.spyOn(knowledgeApi, 'chunks').mockResolvedValue([])
    vi.spyOn(knowledgeApi, 'task').mockResolvedValue(null)
  })

  it('renders a compact back button that targets the current knowledge base document list', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/knowledge-bases/:knowledgeBaseId/documents/:documentId', component: DocumentDetailView },
        { path: '/knowledge-bases/:knowledgeBaseId/documents', component: { template: '<div>文档列表</div>' } },
      ],
    })
    await router.push('/knowledge-bases/1/documents/2')
    await router.isReady()

    const wrapper = mount(DocumentDetailView, { global: { plugins: [router] } })
    await flushPromises()

    const backButton = wrapper.get('a.back-button')
    expect(backButton.text()).toContain('返回文档列表')
    expect(backButton.attributes('href')).toBe('/knowledge-bases/1/documents')
    expect(backButton.get('.back-button-icon').attributes('aria-hidden')).toBe('true')
  })
})
