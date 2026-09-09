<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { knowledgeApi } from '../api/knowledge'
import type { AuditPage } from '../api/types'
import StatusBadge from '../components/StatusBadge.vue'
import { useTenantStore } from '../stores/tenant'

const tenant = useTenantStore()
const filters = reactive({ action: '', resourceType: '', requestId: '', offset: 0, limit: 20 })
const page = ref<AuditPage>({ total: 0, offset: 0, limit: 20, items: [] })
const loading = ref(false)
const error = ref('')

async function load(reset = false) {
  if (!tenant.targetTenantId) return
  if (reset) filters.offset = 0
  loading.value = true
  try { page.value = await knowledgeApi.audit(tenant.targetTenantId, filters) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '审计查询失败' }
  finally { loading.value = false }
}
onMounted(() => load())
watch(() => tenant.targetTenantId, () => load(true))
</script>

<template>
  <div class="page-stack">
    <section class="page-heading"><div><p class="eyebrow">AUDIT TRAIL</p><h2>操作审计</h2><p>追踪知识库、文档、校正和发布动作，不记录知识正文或认证凭据。</p></div></section>
    <section class="panel">
      <form class="filter-bar" @submit.prevent="load(true)"><label>动作<input v-model="filters.action" maxlength="60" placeholder="DOCUMENT_PUBLISH" /></label><label>资源类型<input v-model="filters.resourceType" maxlength="40" placeholder="DOCUMENT_VERSION" /></label><label>请求号<input v-model="filters.requestId" maxlength="64" placeholder="X-Request-Id" /></label><button class="button button-primary">查询</button></form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <div class="data-table audit-table"><div class="table-row table-head"><span>时间 / 操作者</span><span>动作</span><span>资源</span><span>请求号</span><span>结果</span></div><div v-for="item in page.items" :key="item.id" class="table-row"><span><strong>{{ new Date(item.createdAt).toLocaleString('zh-CN') }}</strong><small>用户 {{ item.actorUserId }} · 来源租户 {{ item.actorTenantId }}</small></span><span><code>{{ item.action }}</code></span><span><strong>{{ item.resourceType }}</strong><small>#{{ item.resourceId }}</small></span><span><code>{{ item.requestId }}</code></span><span><StatusBadge :value="item.outcome" /></span></div></div>
      <div v-if="!loading && !page.items.length" class="empty-state"><b>没有审计记录</b><span>当前筛选条件下没有匹配动作。</span></div>
      <div class="pagination"><span>共 {{ page.total }} 条</span><button class="button button-ghost" :disabled="filters.offset === 0" @click="filters.offset = Math.max(0, filters.offset - filters.limit); load()">上一页</button><button class="button button-ghost" :disabled="filters.offset + filters.limit >= page.total" @click="filters.offset += filters.limit; load()">下一页</button></div>
    </section>
  </div>
</template>
