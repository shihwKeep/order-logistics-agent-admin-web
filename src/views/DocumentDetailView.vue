<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { knowledgeApi } from '../api/knowledge'
import type { DocumentChunk, DocumentUnit, IngestionTask, KnowledgeDocument } from '../api/types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useTenantStore } from '../stores/tenant'

const route = useRoute()
const tenant = useTenantStore()
const knowledgeBaseId = Number(route.params.knowledgeBaseId)
const documentId = Number(route.params.documentId)
const document = ref<KnowledgeDocument | null>(null)
const selectedVersionId = ref<number | null>(null)
const task = ref<IngestionTask | null>(null)
const units = ref<DocumentUnit[]>([])
const chunks = ref<DocumentChunk[]>([])
const tab = ref<'source' | 'units' | 'chunks'>('units')
const lowConfidenceOnly = ref(false)
const error = ref('')
const loading = ref(false)
const editingUnit = ref<DocumentUnit | null>(null)
const correctedText = ref('')
const pendingAction = ref<'publish' | 'rollback' | 'disable' | null>(null)
const busy = ref(false)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const selectedVersion = computed(() => document.value?.versions.find((v) => v.id === selectedVersionId.value) || null)
const sourceUrl = computed(() => tenant.targetTenantId && selectedVersionId.value
  ? knowledgeApi.sourceUrl(tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value) : '')
const sourceInline = computed(() => ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'text/plain'].includes(selectedVersion.value?.mimeType || ''))
const processing = computed(() => task.value && ['PENDING', 'RETRY', 'PROCESSING'].includes(task.value.status))

async function load() {
  if (!tenant.targetTenantId) return
  loading.value = true; error.value = ''
  try {
    document.value = await knowledgeApi.document(tenant.targetTenantId, knowledgeBaseId, documentId)
    if (!selectedVersionId.value) selectedVersionId.value = document.value.currentDraftVersionId || document.value.versions[0]?.id || null
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '加载失败' }
  finally { loading.value = false }
}

async function loadVersionData() {
  if (!tenant.targetTenantId || !selectedVersionId.value) return
  const args = [tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value] as const
  try {
    const [nextUnits, nextChunks, nextTask] = await Promise.all([
      knowledgeApi.units(...args, lowConfidenceOnly.value || undefined), knowledgeApi.chunks(...args), knowledgeApi.task(...args),
    ])
    units.value = nextUnits; chunks.value = nextChunks; task.value = nextTask
    schedulePoll()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '版本数据加载失败' }
}

function schedulePoll() {
  if (pollTimer) clearTimeout(pollTimer)
  if (processing.value) pollTimer = setTimeout(async () => { await load(); await loadVersionData() }, 3000)
}

function openCorrection(unit: DocumentUnit) { editingUnit.value = unit; correctedText.value = unit.effectiveText }
async function saveCorrection() {
  if (!editingUnit.value || !selectedVersionId.value || !tenant.targetTenantId) return
  busy.value = true
  try {
    await knowledgeApi.correctUnit(tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value, editingUnit.value.id, correctedText.value)
    editingUnit.value = null; await load(); await loadVersionData()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '校正失败' }
  finally { busy.value = false }
}
async function retry() {
  if (!selectedVersionId.value || !tenant.targetTenantId) return
  busy.value = true
  try { await knowledgeApi.retry(tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value); await loadVersionData() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '重试失败' }
  finally { busy.value = false }
}
async function confirmAction() {
  if (!pendingAction.value || !selectedVersionId.value || !tenant.targetTenantId) return
  busy.value = true
  try {
    if (pendingAction.value === 'publish') await knowledgeApi.publish(tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value)
    if (pendingAction.value === 'rollback') await knowledgeApi.rollback(tenant.targetTenantId, knowledgeBaseId, documentId, selectedVersionId.value)
    if (pendingAction.value === 'disable') await knowledgeApi.disableDocument(tenant.targetTenantId, knowledgeBaseId, documentId)
    pendingAction.value = null; await load(); await loadVersionData()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '操作失败' }
  finally { busy.value = false }
}

onMounted(async () => { await load(); await loadVersionData() })
onUnmounted(() => { if (pollTimer) clearTimeout(pollTimer) })
watch(selectedVersionId, loadVersionData)
watch(lowConfidenceOnly, loadVersionData)
watch(() => tenant.targetTenantId, async () => { await load(); await loadVersionData() })
</script>

<template>
  <div class="page-stack detail-page">
    <section class="page-heading detail-heading"><div><RouterLink class="back-link" :to="`/knowledge-bases/${knowledgeBaseId}/documents`">← 返回文档列表</RouterLink><p class="eyebrow">DOCUMENT INSPECTOR</p><h2>{{ document?.title || '文档详情' }}</h2><p>{{ selectedVersion?.originalFilename }} · {{ selectedVersion ? `${(selectedVersion.fileSize / 1024).toFixed(1)} KB` : '' }}</p></div><div class="heading-actions"><button v-if="selectedVersion?.status === 'READY' && selectedVersion.id === document?.currentDraftVersionId" class="button button-primary" @click="pendingAction = 'publish'">发布当前草稿</button><button v-if="['ARCHIVED', 'PUBLISHED'].includes(selectedVersion?.status || '') && selectedVersion?.id !== document?.currentPublishedVersionId" class="button button-ghost" @click="pendingAction = 'rollback'">回滚到此版本</button><button v-if="document?.currentPublishedVersionId" class="button button-danger-soft" @click="pendingAction = 'disable'">停用线上版本</button></div></section>
    <p v-if="error" class="form-error">{{ error }}</p>
    <section class="version-strip"><label>查看版本<select v-model="selectedVersionId"><option v-for="version in document?.versions" :key="version.id" :value="version.id">v{{ version.versionNumber }} · {{ version.status }} · {{ new Date(version.createdAt).toLocaleString('zh-CN') }}</option></select></label><StatusBadge v-if="selectedVersion" :value="selectedVersion.status" /><div class="version-facts"><span>{{ selectedVersion?.unitCount || 0 }} 个原文单元</span><span>{{ selectedVersion?.chunkCount || 0 }} 个 Chunk</span><span v-if="selectedVersion?.ocrRequired">包含 OCR</span></div></section>
    <section v-if="task" class="task-banner" :class="{ failed: ['FAILED', 'DEAD'].includes(task.status) }"><div class="task-pulse"></div><div><strong>处理任务：{{ task.stage }} / {{ task.status }}</strong><span>重试 {{ task.retryCount }} 次<span v-if="task.lastErrorCode"> · {{ task.lastErrorCode }}</span></span></div><div class="task-progress"><i :style="{ width: task.status === 'DONE' ? '100%' : task.status === 'PROCESSING' ? '68%' : '28%' }"></i></div><button v-if="['FAILED', 'DEAD', 'RETRY'].includes(task.status)" class="button button-ghost" :disabled="busy" @click="retry">手动重试</button></section>
    <section class="inspector">
      <div class="inspector-tabs"><button :class="{ active: tab === 'source' }" @click="tab = 'source'">源文件</button><button :class="{ active: tab === 'units' }" @click="tab = 'units'">解析 / OCR</button><button :class="{ active: tab === 'chunks' }" @click="tab = 'chunks'">Chunks</button><label v-if="tab === 'units'" class="toggle"><input v-model="lowConfidenceOnly" type="checkbox" />只看低置信度</label></div>
      <div v-if="tab === 'source'" class="source-preview"><iframe v-if="sourceInline" :src="sourceUrl" title="源文件预览"></iframe><div v-else><div class="empty-state"><b>此格式使用安全下载查看</b><span>文件仍会经过登录身份与租户权限校验。</span><a class="button button-primary" :href="sourceUrl" target="_blank">打开源文件</a></div></div></div>
      <div v-else-if="tab === 'units'" class="unit-list"><article v-for="unit in units" :key="unit.id" :class="{ 'low-confidence': unit.lowConfidence }"><header><div><b>{{ unit.locationLabel || `${unit.unitType} ${unit.unitIndex + 1}` }}</b><small>{{ unit.titlePath }}</small></div><span v-if="unit.ocrConfidence !== null">OCR {{ Math.round(unit.ocrConfidence * 100) }}%</span><button class="link-button" @click="openCorrection(unit)">人工校正</button></header><div v-if="unit.rawText !== unit.effectiveText" class="revision-note">已应用人工修订 · revision {{ unit.correctionRevision }}</div><pre>{{ unit.effectiveText }}</pre></article><div v-if="!units.length" class="empty-state"><b>没有解析单元</b><span>文档可能仍在处理，或当前筛选没有结果。</span></div></div>
      <div v-else class="chunk-list"><article v-for="chunk in chunks" :key="chunk.id"><header><b>Chunk {{ chunk.chunkIndex + 1 }}</b><span>{{ chunk.tokenCount }} tokens</span></header><small>{{ chunk.titlePath }} · {{ chunk.locationJson }}</small><p>{{ chunk.content }}</p></article><div v-if="!chunks.length" class="empty-state"><b>还没有 Chunk</b><span>完成分块后会在此展示。</span></div></div>
    </section>
    <Teleport to="body"><div v-if="editingUnit" class="modal-backdrop" @click.self="editingUnit = null"><form class="modal-card correction-card" @submit.prevent="saveCorrection"><p class="eyebrow">HUMAN CORRECTION</p><h2>人工校正 · {{ editingUnit.locationLabel }}</h2><div class="correction-columns"><label>OCR / 解析原文<textarea :value="editingUnit.rawText" readonly rows="14"></textarea></label><label>有效正文<textarea v-model="correctedText" rows="14" required></textarea></label></div><p class="muted">提交后当前 Chunk 与草稿索引失效，系统会从分块阶段重新处理。</p><div class="modal-actions"><button type="button" class="button button-ghost" @click="editingUnit = null">取消</button><button class="button button-primary" :disabled="busy">{{ busy ? '提交中…' : '提交校正' }}</button></div></form></div></Teleport>
    <ConfirmDialog :open="!!pendingAction" :busy="busy" :danger="pendingAction === 'disable'" :title="pendingAction === 'publish' ? '发布当前草稿' : pendingAction === 'rollback' ? '回滚文档版本' : '停用线上版本'" :message="pendingAction === 'publish' ? '发布后该版本将参与坐席知识问答。' : pendingAction === 'rollback' ? '系统会先校验双索引完整性，再原子切换发布指针。' : '停用后线上检索会立即拒绝该文档，索引数据异步清理。'" @cancel="pendingAction = null" @confirm="confirmAction" />
  </div>
</template>
