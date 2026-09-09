<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { knowledgeApi } from '../api/knowledge'
import type { KnowledgeBase } from '../api/types'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useTenantStore } from '../stores/tenant'

const tenant = useTenantStore()
const items = ref<KnowledgeBase[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const editorOpen = ref(false)
const editing = ref<KnowledgeBase | null>(null)
const form = reactive({ name: '', description: '' })
const pending = ref<{ type: 'delete' | 'status'; item: KnowledgeBase } | null>(null)
const saving = ref(false)
const filtered = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return query ? items.value.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query)) : items.value
})

async function load() {
  if (!tenant.targetTenantId) return
  loading.value = true
  error.value = ''
  try { items.value = await knowledgeApi.listKnowledgeBases(tenant.targetTenantId) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '加载失败' }
  finally { loading.value = false }
}

function openEditor(item?: KnowledgeBase) {
  editing.value = item || null
  form.name = item?.name || ''
  form.description = item?.description || ''
  editorOpen.value = true
}

async function save() {
  if (!tenant.targetTenantId || !form.name.trim()) return
  saving.value = true
  error.value = ''
  try {
    if (editing.value) await knowledgeApi.updateKnowledgeBase(tenant.targetTenantId, editing.value, form.name.trim(), form.description.trim())
    else await knowledgeApi.createKnowledgeBase(tenant.targetTenantId, form.name.trim(), form.description.trim())
    editorOpen.value = false
    await load()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '保存失败' }
  finally { saving.value = false }
}

async function confirmAction() {
  if (!pending.value || !tenant.targetTenantId) return
  saving.value = true
  try {
    if (pending.value.type === 'delete') await knowledgeApi.deleteKnowledgeBase(tenant.targetTenantId, pending.value.item.id)
    else await knowledgeApi.setKnowledgeBaseStatus(tenant.targetTenantId, pending.value.item.id, pending.value.item.status !== 'ENABLED')
    pending.value = null
    await load()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '操作失败' }
  finally { saving.value = false }
}

onMounted(load)
watch(() => tenant.targetTenantId, load)
</script>

<template>
  <div class="page-stack">
    <section class="page-heading"><div><p class="eyebrow">KNOWLEDGE BASES</p><h2>知识库管理</h2><p>按业务域组织已审核的企业知识。</p></div><button class="button button-primary" @click="openEditor()">＋ 新建知识库</button></section>
    <section class="panel">
      <div class="toolbar"><div class="search-box">⌕<input v-model="keyword" placeholder="搜索名称或说明" /></div><span class="result-count">共 {{ filtered.length }} 个知识库</span></div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <div v-if="loading" class="loading-state">正在加载知识库…</div>
      <div v-else-if="!filtered.length" class="empty-state"><b>没有匹配的知识库</b><span>调整搜索条件，或新建知识库。</span></div>
      <div v-else class="data-table">
        <div class="table-row table-head"><span>知识库</span><span>状态</span><span>更新时间</span><span>操作</span></div>
        <div v-for="item in filtered" :key="item.id" class="table-row">
          <RouterLink class="knowledge-cell" :to="`/knowledge-bases/${item.id}/documents`"><span class="list-icon">知</span><div><strong>{{ item.name }}</strong><small>{{ item.description || '暂无说明' }}</small></div></RouterLink>
          <span><StatusBadge :value="item.status" /></span>
          <span class="muted">{{ new Date(item.updatedAt).toLocaleString('zh-CN') }}</span>
          <span class="row-actions"><RouterLink :to="`/knowledge-bases/${item.id}/documents`">文档</RouterLink><button @click="openEditor(item)">编辑</button><button @click="pending = { type: 'status', item }">{{ item.status === 'ENABLED' ? '停用' : '启用' }}</button><button class="danger-link" @click="pending = { type: 'delete', item }">删除</button></span>
        </div>
      </div>
    </section>
    <Teleport to="body"><div v-if="editorOpen" class="modal-backdrop" @click.self="editorOpen = false"><form class="modal-card editor-card" @submit.prevent="save"><p class="eyebrow">KNOWLEDGE SPACE</p><h2>{{ editing ? '编辑知识库' : '新建知识库' }}</h2><label>知识库名称</label><input v-model="form.name" maxlength="100" required placeholder="例如：售后退款规则" /><label>说明</label><textarea v-model="form.description" maxlength="500" rows="5" placeholder="描述知识范围和使用场景"></textarea><div class="modal-actions"><button type="button" class="button button-ghost" @click="editorOpen = false">取消</button><button class="button button-primary" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button></div></form></div></Teleport>
    <ConfirmDialog :open="!!pending" :busy="saving" :danger="pending?.type === 'delete'" :title="pending?.type === 'delete' ? '删除知识库' : `${pending?.item.status === 'ENABLED' ? '停用' : '启用'}知识库`" :message="pending?.type === 'delete' ? '知识库将被软删除，历史审计仍会保留。确认继续？' : '状态变更会立即影响线上知识检索范围。'" @cancel="pending = null" @confirm="confirmAction" />
  </div>
</template>
