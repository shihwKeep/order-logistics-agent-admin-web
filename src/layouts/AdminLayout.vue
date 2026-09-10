<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTenantStore } from '../stores/tenant'

const auth = useAuthStore()
const tenant = useTenantStore()
const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const brandLogoUrl = '/knowledge-logo.png'

const nav = [
  { to: '/', icon: '⌂', label: '工作台' },
  { to: '/knowledge-bases', icon: '▤', label: '知识库' },
  { to: '/retrieval', icon: '⌕', label: '检索诊断' },
  { to: '/audit', icon: '◷', label: '操作审计' },
]
const title = computed(() => String(route.meta.title || nav.find((item) => item.to === route.path)?.label || '知识库管理'))

async function logout() {
  await auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <div class="app-shell" :class="{ collapsed }">
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" :src="brandLogoUrl" alt="" />
        <div class="brand-copy">
          <strong>享佳知识中枢</strong>
          <span>智能坐席管理台</span>
        </div>
      </div>
      <nav>
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="nav-item">
          <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <span class="health-dot"></span><span class="nav-label">知识服务</span><b class="nav-label">运行中</b>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <button class="icon-button" aria-label="折叠菜单" @click="collapsed = !collapsed">☰</button>
        <div>
          <p class="eyebrow">KNOWLEDGE OPERATIONS</p>
          <h1>{{ title }}</h1>
        </div>
        <div class="topbar-spacer"></div>
        <div class="tenant-chip">{{ tenant.targetTenantName }}</div>
        <div class="user-menu">
          <div class="avatar">{{ auth.identity?.displayName?.slice(0, 1) || '管' }}</div>
          <div><strong>{{ auth.identity?.displayName }}</strong><span>{{ auth.identity?.account }}</span></div>
          <button class="link-button" @click="logout">退出</button>
        </div>
      </header>
      <div class="page-container"><RouterView /></div>
    </main>
  </div>
</template>
