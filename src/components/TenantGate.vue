<script setup lang="ts">
import { ref } from 'vue'
import { useTenantStore } from '../stores/tenant'

const tenant = useTenantStore()
const value = ref('')
const error = ref('')

function confirm() {
  const parsed = Number(value.value)
  try {
    tenant.select(parsed)
    error.value = ''
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '租户 ID 无效'
  }
}
</script>

<template>
  <div v-if="tenant.requiresSelection" class="tenant-gate">
    <div class="tenant-gate-card">
      <div class="tenant-symbol">租</div>
      <p class="eyebrow">超级管理员模式</p>
      <h1>请选择目标租户</h1>
      <p class="muted">所有列表、上传、发布和检索操作都将明确绑定到该租户。</p>
      <form @submit.prevent="confirm">
        <label>租户 ID</label>
        <input v-model="value" inputmode="numeric" placeholder="例如：1" autofocus />
        <p v-if="error" class="field-error">{{ error }}</p>
        <button class="button button-primary button-wide" type="submit">进入租户空间</button>
      </form>
    </div>
  </div>
  <slot v-else />
</template>
