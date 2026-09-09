<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { knowledgeApi } from '../api/knowledge'
import type { KnowledgeBase, RetrievalResult } from '../api/types'
import { useTenantStore } from '../stores/tenant'

const tenant = useTenantStore()
const bases = ref<KnowledgeBase[]>([])
const selected = ref<number[]>([])
const question = ref('')
const layer = ref<'DRAFT' | 'PUBLISHED'>('PUBLISHED')
const result = ref<RetrievalResult | null>(null)
const busy = ref(false)
const error = ref('')

async function loadBases() {
  if (tenant.targetTenantId) bases.value = await knowledgeApi.listKnowledgeBases(tenant.targetTenantId)
}
async function retrieve() {
  if (!tenant.targetTenantId || !question.value.trim()) return
  busy.value = true; error.value = ''; result.value = null
  try { result.value = await knowledgeApi.retrieve(tenant.targetTenantId, question.value.trim(), selected.value, layer.value) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '检索失败' }
  finally { busy.value = false }
}
onMounted(loadBases)
watch(() => tenant.targetTenantId, loadBases)
</script>

<template>
  <div class="page-stack retrieval-page">
    <section class="page-heading"><div><p class="eyebrow">RETRIEVAL LAB</p><h2>检索诊断</h2><p>验证 Elasticsearch 与 Milvus 混合召回、RRF 融合和 BGE 精排结果。</p></div></section>
    <section class="retrieval-console">
      <div class="retrieval-form">
        <label>测试问题</label><textarea v-model="question" rows="5" maxlength="2000" placeholder="例如：客户签收商品后多久可以申请退款？"></textarea>
        <div class="form-row"><label>索引层<select v-model="layer"><option value="PUBLISHED">已发布（线上）</option><option value="DRAFT">草稿（诊断）</option></select></label><label>知识库范围<select multiple v-model="selected"><option v-for="item in bases" :key="item.id" :value="item.id">{{ item.name }}</option></select><small>不选择表示当前租户全部知识库</small></label></div>
        <button class="button button-primary button-wide" :disabled="busy || !question.trim()" @click="retrieve">{{ busy ? '正在混合检索…' : '运行检索' }}</button><p v-if="error" class="form-error">{{ error }}</p>
      </div>
      <div class="pipeline-map"><p class="eyebrow">PIPELINE</p><div><span>问题</span><i>→</i><span>ES Top 30</span><b>＋</b><span>Milvus Top 30</span><i>→</i><span>RRF Top 20</span><i>→</i><span>BGE Top 5</span></div></div>
    </section>
    <section v-if="result" class="panel">
      <div class="diagnostic-summary"><div><span>是否可回答</span><b :class="result.answerable ? 'text-success' : 'text-danger'">{{ result.answerable ? '可以回答' : '证据不足' }}</b></div><div><span>结果码</span><b>{{ result.resultCode }}</b></div><div><span>降级模式</span><b>{{ result.degradationMode }}</b></div><div><span>策略版本</span><b>{{ result.strategyVersion }}</b></div></div>
      <div v-if="!result.evidences.length" class="empty-state"><b>没有可靠证据</b><span>系统不会使用模型常识补充业务规则。</span></div>
      <div v-else class="evidence-list"><article v-for="(evidence, index) in result.evidences" :key="evidence.chunkId"><header><span class="rank">{{ index + 1 }}</span><div><strong>{{ evidence.documentTitle }}</strong><small>{{ evidence.titlePath || evidence.locationJson || '未标注位置' }}</small></div><b>{{ evidence.score.toFixed(4) }}</b></header><p>{{ evidence.content }}</p><footer><span v-for="source in evidence.sources" :key="source" class="source-chip">{{ source }}</span><code>{{ evidence.chunkId }}</code></footer></article></div>
    </section>
  </div>
</template>
