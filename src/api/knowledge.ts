import { apiRequest, jsonBody } from './http'
import type {
  AdminIdentity,
  AuditPage,
  DocumentChunk,
  DocumentUnit,
  IngestionTask,
  KnowledgeBase,
  KnowledgeDocument,
  PublicationRecord,
  RetrievalResult,
  UploadedDocument,
} from './types'

const tenantRoot = (tenantId: number) => `/api/v1/admin/tenants/${tenantId}`
const kbRoot = (tenantId: number) => `${tenantRoot(tenantId)}/knowledge-bases`
const documentRoot = (tenantId: number, knowledgeBaseId: number) =>
  `${kbRoot(tenantId)}/${knowledgeBaseId}/documents`

export const knowledgeApi = {
  login: (account: string, password: string) =>
    apiRequest<AdminIdentity>('/api/v1/admin/auth/login', {
      method: 'POST',
      body: jsonBody({ account, password }),
    }),
  me: () => apiRequest<AdminIdentity>('/api/v1/admin/auth/me'),
  logout: () => apiRequest<void>('/api/v1/admin/auth/logout', { method: 'POST' }),

  listKnowledgeBases: (tenantId: number) => apiRequest<KnowledgeBase[]>(kbRoot(tenantId)),
  createKnowledgeBase: (tenantId: number, name: string, description: string) =>
    apiRequest<KnowledgeBase>(kbRoot(tenantId), {
      method: 'POST',
      body: jsonBody({ name, description: description || null }),
    }),
  updateKnowledgeBase: (tenantId: number, item: KnowledgeBase, name: string, description: string) =>
    apiRequest<KnowledgeBase>(`${kbRoot(tenantId)}/${item.id}`, {
      method: 'PUT',
      body: jsonBody({ name, description: description || null, expectedVersion: item.rowVersion }),
    }),
  setKnowledgeBaseStatus: (tenantId: number, id: number, enabled: boolean) =>
    apiRequest<KnowledgeBase>(`${kbRoot(tenantId)}/${id}/${enabled ? 'enable' : 'disable'}`, {
      method: 'POST',
    }),
  deleteKnowledgeBase: (tenantId: number, id: number) =>
    apiRequest<void>(`${kbRoot(tenantId)}/${id}`, { method: 'DELETE' }),

  listDocuments: (tenantId: number, knowledgeBaseId: number) =>
    apiRequest<KnowledgeDocument[]>(documentRoot(tenantId, knowledgeBaseId)),
  document: (tenantId: number, knowledgeBaseId: number, documentId: number) =>
    apiRequest<KnowledgeDocument>(`${documentRoot(tenantId, knowledgeBaseId)}/${documentId}`),
  uploadDocument: (tenantId: number, knowledgeBaseId: number, file: File, title: string) => {
    const body = new FormData()
    body.set('file', file)
    if (title.trim()) body.set('title', title.trim())
    return apiRequest<UploadedDocument>(documentRoot(tenantId, knowledgeBaseId), {
      method: 'POST',
      body,
    })
  },
  units: (
    tenantId: number,
    knowledgeBaseId: number,
    documentId: number,
    versionId: number,
    lowConfidence?: boolean,
  ) => {
    const query = lowConfidence === undefined ? '' : `?lowConfidence=${lowConfidence}`
    return apiRequest<DocumentUnit[]>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/units${query}`,
    )
  },
  chunks: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    apiRequest<DocumentChunk[]>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/chunks?limit=100`,
    ),
  task: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    apiRequest<IngestionTask | null>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/task`,
    ),
  correctUnit: (
    tenantId: number,
    knowledgeBaseId: number,
    documentId: number,
    versionId: number,
    unitId: number,
    correctedText: string,
  ) =>
    apiRequest<DocumentUnit>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/units/${unitId}/correction`,
      { method: 'PUT', body: jsonBody({ correctedText }) },
    ),
  retry: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    apiRequest<boolean>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/retry`,
      { method: 'POST' },
    ),
  publish: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    apiRequest<PublicationRecord>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/publish`,
      { method: 'POST' },
    ),
  rollback: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    apiRequest<PublicationRecord>(
      `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/rollback`,
      { method: 'POST' },
    ),
  disableDocument: (tenantId: number, knowledgeBaseId: number, documentId: number) =>
    apiRequest<PublicationRecord>(`${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/disable`, {
      method: 'POST',
    }),
  sourceUrl: (tenantId: number, knowledgeBaseId: number, documentId: number, versionId: number) =>
    `${documentRoot(tenantId, knowledgeBaseId)}/${documentId}/versions/${versionId}/source`,

  retrieve: (tenantId: number, question: string, ids: number[], layer: 'DRAFT' | 'PUBLISHED') =>
    apiRequest<RetrievalResult>(`${tenantRoot(tenantId)}/knowledge/retrieve?layer=${layer}`, {
      method: 'POST',
      body: jsonBody({ question, knowledgeBaseIds: ids }),
    }),
  audit: (
    tenantId: number,
    filters: { action?: string; resourceType?: string; requestId?: string; offset: number; limit: number },
  ) => {
    const query = new URLSearchParams()
    if (filters.action) query.set('action', filters.action)
    if (filters.resourceType) query.set('resourceType', filters.resourceType)
    if (filters.requestId) query.set('requestId', filters.requestId)
    query.set('offset', String(filters.offset))
    query.set('limit', String(filters.limit))
    return apiRequest<AuditPage>(`${tenantRoot(tenantId)}/audit-logs?${query}`)
  },
}
