import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('maps processing and failure states to distinct visual tones', () => {
    expect(mount(StatusBadge, { props: { value: 'INDEXING' } }).classes()).toContain('status-processing')
    expect(mount(StatusBadge, { props: { value: 'FAILED' } }).classes()).toContain('status-danger')
  })
})
