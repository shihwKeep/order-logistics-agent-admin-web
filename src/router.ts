import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import AdminLayout from './layouts/AdminLayout.vue'
import DashboardView from './views/DashboardView.vue'
import KnowledgeBasesView from './views/KnowledgeBasesView.vue'
import DocumentsView from './views/DocumentsView.vue'
import DocumentDetailView from './views/DocumentDetailView.vue'
import RetrievalLabView from './views/RetrievalLabView.vue'
import AuditView from './views/AuditView.vue'
import { useAuthStore } from './stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'knowledge-bases', name: 'knowledge-bases', component: KnowledgeBasesView },
        { path: 'knowledge-bases/:knowledgeBaseId/documents', name: 'documents', component: DocumentsView },
        {
          path: 'knowledge-bases/:knowledgeBaseId/documents/:documentId',
          name: 'document-detail',
          component: DocumentDetailView,
        },
        { path: 'retrieval', name: 'retrieval', component: RetrievalLabView },
        { path: 'audit', name: 'audit', component: AuditView },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  if (!auth.initialized) await auth.restore()
  return auth.identity ? true : { name: 'login', query: { redirect: to.fullPath } }
})
