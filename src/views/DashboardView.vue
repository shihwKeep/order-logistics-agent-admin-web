<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { knowledgeApi } from '../api/knowledge'
import type { KnowledgeBase } from '../api/types'
import { useTenantStore } from '../stores/tenant'

const tenant = useTenantStore()
const items = ref<KnowledgeBase[]>([])
const loading = ref(false)
const error = ref('')
const enabled = computed(() => items.value.filter((item) => item.status === 'ENABLED').length)

async function load() {
  if (!tenant.targetTenantId) return
  loading.value = true
  error.value = ''
  try {
    items.value = await knowledgeApi.listKnowledgeBases(tenant.targetTenantId)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => tenant.targetTenantId, load)
</script>

<template>
  <div class="page-stack">
    <section class="hero-card">
      <div>
        <p class="eyebrow">今日知识运营</p>
        <h2>把复杂规则，沉淀为坐席可用的答案。</h2>
        <p>从文档上传、OCR 校正到双索引发布，每个版本都清晰可追踪。</p>
      </div>
      <RouterLink class="button button-primary" to="/knowledge-bases">管理知识库</RouterLink>
    </section>
    <p v-if="error" class="form-error">{{ error }}</p>
    <section class="metric-grid">
      <article><span>知识库总数</span><b>{{ loading ? '—' : items.length }}</b><small>当前租户空间</small></article>
      <article><span>已启用</span><b class="accent">{{ loading ? '—' : enabled }}</b><small>参与线上检索</small></article>
      <article><span>已停用</span><b>{{ loading ? '—' : items.length - enabled }}</b><small>不进入坐席问答</small></article>
      <article><span>检索策略</span><b class="metric-text">ES + Milvus</b><small>RRF 融合 · BGE 精排</small></article>
    </section>
    <section class="panel">
      <div class="panel-header"><div><p class="eyebrow">KNOWLEDGE SPACES</p><h2>最近知识库</h2></div><RouterLink to="/knowledge-bases">查看全部 →</RouterLink></div>
      <div v-if="!items.length && !loading" class="empty-state"><b>还没有知识库</b><span>创建第一个知识空间，开始沉淀企业规则。</span></div>
      <div v-else class="compact-list">
        <RouterLink v-for="item in items.slice(0, 5)" :key="item.id" :to="`/knowledge-bases/${item.id}/documents`">
          <span class="list-icon">文</span><div><strong>{{ item.name }}</strong><small>{{ item.description || '暂无说明' }}</small></div>
          <span class="status-badge" :class="item.status === 'ENABLED' ? 'status-success' : 'status-neutral'">{{ item.status }}</span><span>›</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
