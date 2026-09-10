import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { knowledgeApi } from '../api/knowledge'
import { useAuthStore } from '../stores/auth'
import RetrievalLabView from './RetrievalLabView.vue'
import '../styles.css'

describe('RetrievalLabView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.identity = {
      userId: 1,
      account: '74680',
      displayName: '石海文',
      tenantId: 1,
      roles: ['KNOWLEDGE_ADMIN'],
    }
    vi.spyOn(knowledgeApi, 'listKnowledgeBases').mockResolvedValue([])
  })

  it('keeps the index layer selector at a compact single-line height', () => {
    const wrapper = mount(RetrievalLabView)
    const field = wrapper.get('label.index-layer-field')
    const selector = field.get('select')

    expect(getComputedStyle(field.element).alignSelf).toBe('start')
    expect(getComputedStyle(selector.element).height).toBe('44px')
  })

  it('shows the configured RRF candidate limit', () => {
    const wrapper = mount(RetrievalLabView)

    expect(wrapper.get('.pipeline-map').text()).toContain('RRF Top 10')
    expect(wrapper.get('.pipeline-map').text()).not.toContain('RRF Top 20')
  })
})
