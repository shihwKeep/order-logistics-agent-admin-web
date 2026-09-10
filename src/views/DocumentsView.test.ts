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
})
