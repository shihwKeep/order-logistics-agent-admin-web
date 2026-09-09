<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: string }>()
const tone = computed(() => {
  if (['ENABLED', 'READY', 'PUBLISHED', 'SUCCESS', 'DONE'].includes(props.value)) return 'success'
  if (['FAILED', 'DEAD', 'DISABLED'].includes(props.value)) return 'danger'
  if (['PARSING', 'OCR_PROCESSING', 'CHUNKING', 'INDEXING', 'PROCESSING'].includes(props.value))
    return 'processing'
  return 'neutral'
})
</script>

<template><span class="status-badge" :class="`status-${tone}`">{{ value }}</span></template>
