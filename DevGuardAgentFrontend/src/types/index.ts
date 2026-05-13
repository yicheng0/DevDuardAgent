export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIOpsStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  phase?: 'understand' | 'retrieve' | 'observe' | 'reason' | 'respond';
  toolName?: string;
  description?: string;
  result?: string;
  evidence?: string[];
  durationMs?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIOpsResult {
  traceId?: string;
  steps: AIOpsStep[];
  finalReport?: string;
}

export interface AgentTraceEvent {
  traceId: string;
  step: AIOpsStep;
}

export type ChatMode = 'quick' | 'stream';

export type NavItemId =
  | 'overview'
  | 'alerts'
  | 'logs'
  | 'metrics'
  | 'knowledge'
  | 'trace'
  | 'history'
  | 'settings';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export interface IncidentItem {
  id: string;
  title: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigating' | 'resolved';
  updatedAt: string;
  summary: string;
  owner: string;
  affectedUsers: string;
  signals: string[];
}

export interface EvidenceItem {
  id: string;
  type: 'metric' | 'log' | 'trace' | 'doc';
  source: string;
  content: string;
  confidence: number;
}

export interface RemediationStep {
  id: string;
  title: string;
  status: 'ready' | 'running' | 'blocked' | 'done';
  risk: 'low' | 'medium' | 'high';
  requiresApproval?: boolean;
  command?: string;
}

export interface LogAnalyzeRequest {
  region: string;
  topicId: string;
  query: string;
  startTime?: string;
  endTime?: string;
  limit: number;
}

export interface LogSample {
  timestamp?: string;
  level?: string;
  message: string;
}

export interface LogAnalyzeResult {
  summary: string;
  patterns: string[];
  samples: LogSample[];
  suggestions: string[];
  rawResult: string;
  toolName: string;
  resultCount: number;
  startedAt: string;
  endedAt: string;
  durationMs: number;
}

export type MetricHealthStatus = 'healthy' | 'warning' | 'critical';

export interface MetricTrendPoint {
  label: string;
  requests: number;
  errorRate: number;
  latencyMs: number;
  resource: number;
}

export interface MetricServiceHealth {
  id: string;
  name: string;
  environment: string;
  owner: string;
  status: MetricHealthStatus;
  slo: number;
  sloTarget: number;
  errorBudgetRemaining: number;
  burnRate: number;
  rps: number;
  errorRate: number;
  p95LatencyMs: number;
  cpu: number;
  memory: number;
  activeAlerts: number;
  updatedAt: string;
  trend: MetricTrendPoint[];
}

export interface MetricHealthSummary {
  totalServices: number;
  healthyServices: number;
  warningServices: number;
  criticalServices: number;
  averageSlo: number;
  averageErrorBudgetRemaining: number;
  activeAlerts: number;
  worstBurnRate: number;
}

export interface ConfigSecret {
  hasValue: boolean;
  value: string;
}

export interface ModelRuntimeConfig {
  apiKey: ConfigSecret;
  baseUrl: string;
  model: string;
}

export interface EmbeddingRuntimeConfig {
  apiKey: ConfigSecret;
  baseUrl: string;
  model: string;
}

export interface RuntimeConfig {
  quickModel: ModelRuntimeConfig;
  thinkModel: ModelRuntimeConfig;
  embedding: EmbeddingRuntimeConfig;
  mcpUrl: string;
  milvusAddress: string;
  fileDir: string;
}

export type ConfigTestTarget = 'quick_model' | 'think_model' | 'embedding' | 'milvus';

export interface ConfigTestResult {
  target: ConfigTestTarget;
  ok: boolean;
  message: string;
}

export type KnowledgeDocumentStatus =
  | 'indexing'
  | 'ready'
  | 'failed'
  | 'delete_failed'
  | 'deleted';

export type KnowledgeTaskStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  filePath: string;
  source: string;
  sha256: string;
  size: number;
  status: KnowledgeDocumentStatus;
  chunkCount: number;
  activeTaskId?: string;
  createdAt: string;
  updatedAt: string;
  lastIndexedAt?: string;
  lastError?: string;
}

export interface KnowledgeTask {
  id: string;
  documentId: string;
  type: 'index' | 'delete' | 'reindex';
  status: KnowledgeTaskStatus;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeUploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  documentId: string;
  taskId: string;
  status: KnowledgeDocumentStatus;
}
