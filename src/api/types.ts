export interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  timestamp: string
}

export type KnowledgeRole = 'KNOWLEDGE_ADMIN' | 'KNOWLEDGE_SUPER_ADMIN'

export interface AdminIdentity {
  userId: number
  account: string
  displayName: string
  tenantId: number
  roles: KnowledgeRole[]
}

export interface KnowledgeBase {
  id: number
  tenantId: number
  name: string
  description: string | null
  status: 'ENABLED' | 'DISABLED'
  rowVersion: number
  createdAt: string
  updatedAt: string
}

export interface DocumentVersion {
  id: number
  versionNumber: number
  status: string
  originalFilename: string
  mimeType: string
  fileSize: number
  ocrRequired: boolean
  unitCount: number
  chunkCount: number
  lastErrorCode: string | null
  createdAt: string
  updatedAt: string
}

export interface KnowledgeDocument {
  id: number
  tenantId: number
  knowledgeBaseId: number
  title: string
  currentDraftVersionId: number | null
  currentPublishedVersionId: number | null
  rowVersion: number
  createdAt: string
  updatedAt: string
  versions: DocumentVersion[]
}

export interface UploadedDocument {
  id: number
  tenantId: number
  knowledgeBaseId: number
  title: string
  currentDraftVersion: DocumentVersion
  currentPublishedVersionId: number | null
}

export interface DocumentUnit {
  id: number
  unitType: string
  unitIndex: number
  locationLabel: string | null
  titlePath: string | null
  rawText: string
  effectiveText: string
  ocrConfidence: number | null
  lowConfidence: boolean
  correctionRevision: number
}

export interface DocumentChunk {
  id: number
  unitId: number
  chunkIndex: number
  titlePath: string | null
  content: string
  tokenCount: number
  locationJson: string | null
  createdAt: string
}

export interface IngestionTask {
  id: number
  stage: string
  status: string
  retryCount: number
  nextRunAt: string
  lockedUntil: string | null
  lastErrorCode: string | null
}

export interface PublicationRecord {
  id: number
  tenantId: number
  knowledgeBaseId: number
  documentId: number
  fromVersionId: number | null
  toVersionId: number | null
  action: 'PUBLISH' | 'ROLLBACK' | 'DISABLE'
  requestId: string
  chunkCount: number
  createdAt: string
}

export interface Evidence {
  knowledgeBaseId: number
  documentId: number
  versionId: number
  chunkId: string
  documentTitle: string
  titlePath: string | null
  content: string
  locationJson: string | null
  score: number
  sources: Array<'VECTOR' | 'KEYWORD'>
}

export interface RetrievalResult {
  answerable: boolean
  evidences: Evidence[]
  strategyVersion: string
  degradationMode: string
  resultCode: string
}

export interface AuditLog {
  id: number
  tenantId: number
  actorUserId: number
  actorTenantId: number
  action: string
  resourceType: string
  resourceId: string
  requestId: string
  outcome: string
  detailJson: string
  createdAt: string
}

export interface AuditPage {
  total: number
  offset: number
  limit: number
  items: AuditLog[]
}
