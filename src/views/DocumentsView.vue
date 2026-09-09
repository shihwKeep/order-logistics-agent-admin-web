<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { knowledgeApi } from '../api/knowledge'
import type { KnowledgeDocument } from '../api/types'
import StatusBadge from '../components/StatusBadge.vue'
import { useTenantStore } from '../stores/tenant'

const route = useRoute()
const tenant = useTenantStore()
const knowledgeBaseId = Number(route.params.knowledgeBaseId)
const items = ref<KnowledgeDocument[]>([])
const loading = ref(false)
const uploading = ref(false)
const dragActive = ref(false)
const error = ref('')
const title = ref('')
const file = ref<File | null>(null)

async function load() {
  if (!tenant.targetTenantId) return
  loading.value = true
  try { items.value = await knowledgeApi.listDocuments(tenant.targetTenantId, knowledgeBaseId) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '加载失败' }
  finally { loading.value = false }
}

function choose(files: FileList | null) { if (files?.[0]) file.value = files[0] }

async function upload() {
  if (!tenant.targetTenantId || !file.value) return
  uploading.value = true
  error.value = ''
  try {
    await knowledgeApi.uploadDocument(tenant.targetTenantId, knowledgeBaseId, file.value, title.value)
    file.value = null
    title.value = ''
    await load()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '上传失败' }
  finally { uploading.value = false }
}

function version(item: KnowledgeDocument) { return item.versions?.find((v) => v.id === item.currentDraftVersionId) }
onMounted(load)
watch(() => tenant.targetTenantId, load)
</script>

<template>
  <div class="page-stack">
    <section class="page-heading"><div><RouterLink class="back-link" to="/knowledge-bases">← 返回知识库</RouterLink><p class="eyebrow">DOCUMENT PIPELINE</p><h2>文档与版本</h2><p>上传后将自动完成解析、OCR、分块和双索引构建。</p></div></section>
    <section class="upload-panel">
      <div class="drop-zone" :class="{ active: dragActive }" @dragenter.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @dragover.prevent @drop.prevent="dragActive = false; choose($event.dataTransfer?.files || null)">
        <div class="upload-icon">⇧</div><div><strong>{{ file?.name || '拖放文件到这里，或点击选择' }}</strong><span>PDF、DOCX、XLS/XLSX、CSV、PPTX、TXT、Markdown、HTML、PNG/JPG · 最大 100 MB</span></div>
        <label class="button button-ghost file-button">选择文件<input type="file" hidden @change="choose(($event.target as HTMLInputElement).files)" /></label>
      </div>
      <div class="upload-meta"><input v-model="title" placeholder="文档标题（可选，默认使用文件名）" /><button class="button button-primary" :disabled="!file || uploading" @click="upload">{{ uploading ? '上传中…' : '上传并处理' }}</button></div>
      <p v-if="error" class="form-error">{{ error }}</p>
    </section>
    <section class="panel">
      <div class="panel-header"><div><p class="eyebrow">DOCUMENTS</p><h2>文档列表</h2></div><span class="result-count">共 {{ items.length }} 份</span></div>
      <div v-if="loading" class="loading-state">正在加载文档…</div>
      <div v-else-if="!items.length" class="empty-state"><b>还没有文档</b><span>上传第一份业务规则文档。</span></div>
      <div v-else class="document-grid">
        <RouterLink v-for="item in items" :key="item.id" class="document-card" :to="`/knowledge-bases/${knowledgeBaseId}/documents/${item.id}`">
          <div class="doc-type">{{ version(item)?.originalFilename.split('.').pop()?.toUpperCase() || 'DOC' }}</div>
          <div class="doc-main"><strong>{{ item.title }}</strong><span>{{ version(item)?.originalFilename }}</span><small>更新于 {{ new Date(item.updatedAt).toLocaleString('zh-CN') }}</small></div>
          <div class="doc-meta"><StatusBadge :value="version(item)?.status || 'UNKNOWN'" /><small>草稿 v{{ version(item)?.versionNumber || '—' }} · {{ version(item)?.chunkCount || 0 }} Chunks</small></div><span class="chevron">›</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
