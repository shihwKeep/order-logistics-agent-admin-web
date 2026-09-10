<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '../api/http'
import { useAuthStore } from '../stores/auth'

const account = ref('')
const password = ref('')
const error = ref('')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function submit() {
  error.value = ''
  try {
    await auth.login(account.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (cause) {
    error.value = cause instanceof ApiError ? cause.message : '登录失败，请检查服务连接'
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-story">
      <div class="story-orbit orbit-one"></div><div class="story-orbit orbit-two"></div>
      <div class="story-content">
        <div class="brand brand-light"><div class="brand-mark">享</div><strong>享佳知识中枢</strong></div>
        <p class="eyebrow light">ENTERPRISE KNOWLEDGE</p>
        <h1>让每一次坐席回答，<br />都有可靠依据。</h1>
        <p>统一管理商品、订单、物流与售后规则，构建可发布、可回滚、可追溯的企业知识。</p>
        <div class="story-stats">
          <div><b>双路</b><span>混合召回</span></div><div><b>全程</b><span>版本追踪</span></div><div><b>严格</b><span>租户隔离</span></div>
        </div>
      </div>
    </section>
    <section class="login-panel">
      <form class="login-card" @submit.prevent="submit">
        <h2>登录管理台</h2>
        <label>账号</label>
        <input v-model="account" autocomplete="username" placeholder="请输入账号或工号" required />
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" required />
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="button button-primary button-wide" type="submit" :disabled="auth.busy">
          {{ auth.busy ? '正在验证…' : '安全登录' }}
        </button>
      </form>
    </section>
  </main>
</template>
