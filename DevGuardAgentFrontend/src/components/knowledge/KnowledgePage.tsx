import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Loader2,
  Search,
  ShieldX,
  RefreshCcw,
  RotateCcw,
  SearchCheck,
  Server,
  Trash2,
  Upload,
} from 'lucide-react';
import { KnowledgeDocument, KnowledgeHealth, KnowledgeSearchResult, KnowledgeTask, KnowledgeUploadResult } from '@/types';

type ApiResponse<T> = {
  message: string;
  data: T;
};

type PendingAction = {
  documentId: string;
  type: 'reindex' | 'delete' | 'cancel' | 'cleanup' | 'toggle';
};

const acceptedExtensions = '.md,.markdown,.txt';

const statusLabel: Record<KnowledgeDocument['status'], string> = {
  indexing: '索引中',
  ready: '可检索',
  failed: '索引失败',
  delete_failed: '删除失败',
  deleted: '已删除',
  canceled: '已取消',
};

const statusStyle: Record<KnowledgeDocument['status'], string> = {
  indexing: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  ready: 'border-emerald-400/20 bg-[#4f8cff]/10 text-[#c3d7ff]',
  failed: 'border-red-400/20 bg-red-400/10 text-red-200',
  delete_failed: 'border-red-400/20 bg-red-400/10 text-red-200',
  deleted: 'border-white/10 bg-white/[0.04] text-slate-400',
  canceled: 'border-white/10 bg-white/[0.04] text-slate-400',
};

const request = async <T,>(url: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const requestLabel = `${method} ${url}`;
  const response = await fetch(url, options);
  const rawBody = await response.text();
  let body: ApiResponse<T> | null = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as ApiResponse<T>;
    } catch {
      if (response.status === 404) {
        throw new Error(
          `知识库接口未找到：${requestLabel} 返回 404。请确认后端已重启，且前端代理指向 http://localhost:8000。`
        );
      }
      throw new Error(`${requestLabel} 返回非 JSON 响应：HTTP ${response.status} ${rawBody}`);
    }
  }

  if (!body) {
    if (response.status === 404) {
      throw new Error(
        `知识库接口未找到：${requestLabel} 返回 404。请确认后端已重启，且前端代理指向 http://localhost:8000。`
      );
    }
    throw new Error(`${requestLabel} 无响应内容：HTTP ${response.status}`);
  }

  if (!response.ok || body.message !== 'OK') {
    throw new Error(`${requestLabel} 请求失败：${body.message || `HTTP ${response.status}`}`);
  }
  return body.data;
};

const formatBytes = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatScore = (score: number) => {
  if (!Number.isFinite(score) || score <= 0) return '-';
  return score.toFixed(3);
};

const scoreToneClass = (score: number) => {
  if (score >= 0.75) return 'border-emerald-400/20 bg-[#4f8cff]/10 text-[#c3d7ff]';
  if (score >= 0.45) return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  return 'border-white/10 bg-white/[0.04] text-slate-400';
};

const isActiveDocument = (doc: KnowledgeDocument) => doc.status === 'indexing' || Boolean(doc.activeTaskId);
const isCancelableDocument = (doc: KnowledgeDocument) => doc.status === 'indexing' && Boolean(doc.activeTaskId);
const isCleanableDocument = (doc: KnowledgeDocument) =>
  doc.status === 'failed' || doc.status === 'canceled' || doc.status === 'delete_failed';

const KnowledgePage = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [latestTask, setLatestTask] = useState<KnowledgeTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isReindexingAll, setIsReindexingAll] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [health, setHealth] = useState<KnowledgeHealth | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTopK, setSearchTopK] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<KnowledgeSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveTasks = documents.some(isActiveDocument);
  const hasReadyDocuments = documents.some((doc) => doc.status === 'ready');

  const stats = useMemo(() => {
    const ready = documents.filter((doc) => doc.status === 'ready').length;
    const enabled = documents.filter((doc) => doc.enabled && doc.status === 'ready').length;
    const indexing = documents.filter((doc) => doc.status === 'indexing').length;
    const failed = documents.filter((doc) => doc.status === 'failed' || doc.status === 'delete_failed').length;
    const chunks = documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
    return { ready, enabled, indexing, failed, chunks };
  }, [documents]);

  const loadDocuments = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError('');
    try {
      const data = await request<{ documents: KnowledgeDocument[] }>('/api/knowledge/documents');
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取知识库文档失败');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await request<KnowledgeHealth>('/api/knowledge/health');
      setHealth(data);
    } catch (err) {
      setHealth({
        address: '-',
        ok: false,
        tcpOk: false,
        sdkOk: false,
        databaseOk: false,
        collectionOk: false,
        collectionLoaded: false,
        message: err instanceof Error ? err.message : 'Milvus 健康检查失败',
        suggestion: '确认后端已启动，并检查 /api 代理是否指向 http://localhost:8000。',
        durationMs: 0,
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadHealth();
  }, [loadDocuments, loadHealth]);

  useEffect(() => {
    if (!hasActiveTasks) return undefined;
    const timer = window.setInterval(() => {
      loadDocuments(true);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [hasActiveTasks, loadDocuments]);

  const fetchTask = async (taskId: string) => {
    if (!taskId) return;
    try {
      const data = await request<{ task: KnowledgeTask }>(`/api/knowledge/tasks?id=${encodeURIComponent(taskId)}`);
      setLatestTask(data.task);
    } catch {
      setLatestTask(null);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await request<KnowledgeUploadResult>('/api/upload', {
        method: 'POST',
        body: formData,
      });
      setSuccess(`${data.fileName} 已加入索引队列`);
      await loadDocuments(true);
      await fetchTask(data.taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReindex = async (documentId: string) => {
    setPendingAction({ documentId, type: 'reindex' });
    setError('');
    setSuccess('');
    try {
      const data = await request<{ task: KnowledgeTask }>('/api/knowledge/documents/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      setLatestTask(data.task);
      setSuccess('已创建重建索引任务');
      await loadDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重建索引失败');
    } finally {
      setPendingAction(null);
    }
  };

  const handleReindexAll = async () => {
    setIsReindexingAll(true);
    setError('');
    setSuccess('');
    try {
      const data = await request<{ tasks: KnowledgeTask[] }>('/api/knowledge/documents/reindex_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setLatestTask(data.tasks[0] ?? null);
      setSuccess(data.tasks.length > 0 ? `已创建 ${data.tasks.length} 个重建任务` : '没有需要重建的启用文档');
      await loadDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重建全部失败');
    } finally {
      setIsReindexingAll(false);
    }
  };

  const handleToggleEnabled = async (doc: KnowledgeDocument) => {
    setPendingAction({ documentId: doc.id, type: 'toggle' });
    setError('');
    setSuccess('');
    try {
      const data = await request<{ document: KnowledgeDocument }>('/api/knowledge/documents/enabled', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, enabled: !doc.enabled }),
      });
      setDocuments((current) => current.map((item) => (item.id === data.document.id ? data.document : item)));
      setSuccess(data.document.enabled ? '文档已启用检索' : '文档已禁用检索');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新文档检索状态失败');
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (confirmDeleteId !== documentId) {
      setConfirmDeleteId(documentId);
      return;
    }
    setPendingAction({ documentId, type: 'delete' });
    setError('');
    setSuccess('');
    try {
      const data = await request<{ task: KnowledgeTask }>(`/api/knowledge/documents?id=${encodeURIComponent(documentId)}`, {
        method: 'DELETE',
      });
      setLatestTask(data.task);
      setSuccess('已创建删除任务');
      setConfirmDeleteId(null);
      await loadDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除文档失败');
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelTask = async (doc: KnowledgeDocument) => {
    if (!doc.activeTaskId) return;
    setPendingAction({ documentId: doc.id, type: 'cancel' });
    setError('');
    setSuccess('');
    try {
      const data = await request<{ task: KnowledgeTask }>('/api/knowledge/tasks/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: doc.activeTaskId }),
      });
      setLatestTask(data.task);
      setSuccess('已发送取消任务请求');
      await loadDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消任务失败');
    } finally {
      setPendingAction(null);
    }
  };

  const handleCleanup = async (documentId: string) => {
    setPendingAction({ documentId, type: 'cleanup' });
    setError('');
    setSuccess('');
    try {
      const data = await request<{ task: KnowledgeTask }>('/api/knowledge/documents/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      setLatestTask(data.task);
      setSuccess('已创建清理索引任务');
      await loadDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '清理索引失败');
    } finally {
      setPendingAction(null);
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('请输入要检索的问题');
      return;
    }
    if (!hasReadyDocuments) {
      setSearchError('需要至少一份状态为“可检索”的文档');
      return;
    }
    if (health && !health.ok) {
      setSearchError(`${health.message}${health.error ? `：${health.error}` : ''}`);
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const data = await request<KnowledgeSearchResult>('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: searchTopK }),
      });
      setSearchResult(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : '知识库检索失败');
    } finally {
      setIsSearching(false);
    }
  };

  const activeTaskLabel = latestTask
    ? `${latestTask.type} · ${latestTask.status} · ${formatDate(latestTask.updatedAt)}`
    : hasActiveTasks
      ? '有任务正在执行'
      : '当前无运行任务';
  const isSearchDisabled = isSearching || !hasReadyDocuments || !searchQuery.trim();

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:overflow-hidden">
      <div className="grid h-full min-h-[760px] gap-3 xl:grid-cols-[minmax(620px,1fr)_320px]">
        <main className="app-surface flex min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm">
          <header className="shrink-0 border-b border-white/10 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-[#8fb5ff]">
                  <Database className="h-3.5 w-3.5" />
                  Knowledge Base
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-50">知识库管理</h1>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  管理 Agent 可检索的运维手册、复盘材料和内部处置经验。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadDocuments()}
                  disabled={isLoading || isUploading || isReindexingAll}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  刷新
                </button>
                <button
                  type="button"
                  onClick={handleReindexAll}
                  disabled={isLoading || isUploading || isReindexingAll || hasActiveTasks || stats.enabled === 0}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReindexingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  重建全部
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="brand-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  上传文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={acceptedExtensions}
                  onChange={handleUpload}
                />
              </div>
            </div>
          </header>

          <section className="grid shrink-0 gap-3 border-b border-white/10 bg-white/[0.03] p-4 sm:grid-cols-4">
            <StatCard label="可检索文档" value={stats.ready} tone="emerald" />
            <StatCard label="已启用" value={stats.enabled} tone="slate" />
            <StatCard label="索引中" value={stats.indexing} tone="amber" />
            <StatCard label="异常文档" value={stats.failed} tone="red" />
          </section>

          {(error || success) && (
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && !error && (
                <div className="flex items-start gap-2 rounded-lg border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-3 py-2 text-sm text-[#c3d7ff]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在读取知识库
              </div>
            ) : documents.length === 0 ? (
              <EmptyState onUpload={() => fileInputRef.current?.click()} isUploading={isUploading} />
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/10">
                <div className="hidden grid-cols-[minmax(220px,1.5fr)_110px_96px_120px_156px_132px] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-400 lg:grid">
                  <span>文档</span>
                  <span>大小</span>
                  <span>状态</span>
                  <span>片段</span>
                  <span>更新时间</span>
                  <span className="text-right">操作</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {documents.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      pendingAction={pendingAction}
                      confirmDeleteId={confirmDeleteId}
                      onReindex={handleReindex}
                      onToggleEnabled={handleToggleEnabled}
                      onDelete={handleDelete}
                      onCancelTask={handleCancelTask}
                      onCleanup={handleCleanup}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="app-surface flex min-h-[520px] flex-col overflow-hidden rounded-lg border shadow-sm xl:min-h-0">
          <div className="border-b border-white/10 px-4 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-50">
              <SearchCheck className="h-4 w-4 text-[#8fb5ff]" />
              运行状态
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">索引任务会自动轮询刷新，完成后停止。</p>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <section className="app-surface-muted rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-50">
                {hasActiveTasks ? <Loader2 className="h-4 w-4 animate-spin text-[#8fb5ff]" /> : <CheckCircle2 className="h-4 w-4 text-[#8fb5ff]" />}
                {hasActiveTasks ? '任务执行中' : '任务空闲'}
              </div>
              <p className="mt-2 break-all text-xs leading-5 text-slate-400">{activeTaskLabel}</p>
            </section>

            <section className="app-surface rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-50">
                    <Server className="h-4 w-4 text-[#8fb5ff]" />
                    向量库状态
                  </h3>
                  <p className="mt-1 truncate text-xs text-slate-400">{health?.address || '未检测'}</p>
                </div>
                <button
                  type="button"
                  onClick={loadHealth}
                  disabled={isCheckingHealth}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCheckingHealth ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                  检测
                </button>
              </div>
              <div
                className={`mt-3 rounded-md border px-3 py-2 text-xs leading-5 ${
                  health?.ok
                    ? 'border-emerald-400/20 bg-[#4f8cff]/10 text-[#c3d7ff]'
                    : health
                      ? 'border-red-400/20 bg-red-400/10 text-red-200'
                      : 'border-white/10 bg-white/[0.04] text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {isCheckingHealth ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : health?.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {isCheckingHealth ? '正在检测 Milvus' : health?.message || '等待检测'}
                </div>
                {health?.error && <p className="mt-1 break-words font-normal">{health.error}</p>}
                {health?.suggestion && (
                  <p className="mt-2 rounded border border-current/20 bg-white/[0.04] px-2 py-1.5 font-normal">
                    {health.suggestion}
                  </p>
                )}
                {health && (
                  <p className="mt-2 text-[11px] opacity-80">
                    TCP {health.tcpOk ? 'OK' : 'FAIL'} · SDK {health.sdkOk ? 'OK' : 'FAIL'} · Collection{' '}
                    {health.collectionLoaded ? 'Loaded' : 'Unloaded'} · {health.durationMs}ms
                  </p>
                )}
              </div>
            </section>

            <section className="app-surface rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-50">
                  <Search className="h-4 w-4 text-[#8fb5ff]" />
                  检索测试
                </h3>
                <span className="text-xs font-medium text-slate-400">TopK {searchTopK}</span>
              </div>
              <form className="mt-3 space-y-3" onSubmit={handleSearch}>
                <label className="block text-xs font-semibold text-slate-400" htmlFor="knowledge-search-query">
                  查询内容
                </label>
                <textarea
                  id="knowledge-search-query"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  rows={3}
                  placeholder="例如：接口失败率过高怎么处理"
                  className="min-h-[88px] w-full resize-none rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-slate-50 outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/30"
                />
                <div className="flex items-end gap-2">
                  <label className="min-w-0 flex-1 text-xs font-semibold text-slate-400" htmlFor="knowledge-search-topk">
                    返回片段
                    <select
                      id="knowledge-search-topk"
                      value={searchTopK}
                      onChange={(event) => setSearchTopK(Number(event.target.value))}
                      className="mt-1 h-11 w-full cursor-pointer rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-50 outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/30"
                    >
                      {[3, 5, 8, 10, 20].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={isSearchDisabled}
                    className="brand-button h-11 shrink-0 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
                    测试
                  </button>
                </div>
              </form>
              {!hasReadyDocuments && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
                  当前没有可检索文档，上传并等待索引完成后再测试。
                </p>
              )}
              {searchError && (
                <p className="mt-3 rounded-md border border-red-200 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-200">
                  {searchError}
                </p>
              )}
              {searchResult && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>命中 {searchResult.documents.length} 条</span>
                    <span className="truncate">{searchResult.query}</span>
                  </div>
                  {searchResult.documents.length === 0 ? (
                    <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-400">
                      没有召回片段，可以换一个更贴近文档措辞的问题。
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {searchResult.documents.map((doc, index) => (
                        <article
                          key={`${doc.id || doc.source}-${index}`}
                          className={`rounded-md border p-3 ${doc.score > 0 && doc.score < 0.45 ? 'border-white/10 bg-white/[0.04] opacity-80' : 'border-white/10 bg-white/[0.04]'}`}
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#4f8cff]/12 text-[#8fb5ff]">
                              {index + 1}
                            </span>
                            <span className={`shrink-0 rounded border px-1.5 py-0.5 ${scoreToneClass(doc.score)}`}>
                              {formatScore(doc.score)}
                            </span>
                            <span className="truncate">{doc.fileName || doc.source || '未知来源'}</span>
                          </div>
                          {doc.source && <p className="mt-1 truncate text-[11px] text-slate-400">{doc.source}</p>}
                          <p className="mt-2 line-clamp-4 break-words text-xs leading-5 text-slate-300">{doc.content}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="app-surface rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-slate-50">上传规则</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <RuleItem icon={FileText} text="支持 TXT、MD、Markdown 文件" />
                <RuleItem icon={Database} text="同内容文件会按 hash 去重" />
                <RuleItem icon={RotateCcw} text="重建会替换旧向量片段" />
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-400/10 p-4 text-sm text-amber-100">
              <h3 className="font-semibold">检索影响</h3>
              <p className="mt-2 leading-6">
                状态为“可检索”的文档会参与 Agent 的内部文档召回；索引失败的文档不会可靠出现在回答上下文中。
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};

type StatTone = 'emerald' | 'amber' | 'red' | 'slate';

const statToneClass: Record<StatTone, string> = {
  emerald: 'bg-[#4f8cff]/10 text-[#c3d7ff] border-[#4f8cff]/20',
  amber: 'bg-amber-400/10 text-amber-200 border-amber-200',
  red: 'bg-red-400/10 text-red-200 border-red-200',
  slate: 'bg-white/[0.03] text-slate-300 border-white/10',
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone: StatTone }) => (
  <div className={`rounded-lg border p-3 ${statToneClass[tone]}`}>
    <p className="text-xs font-semibold opacity-80">{label}</p>
    <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
  </div>
);

const EmptyState = ({ onUpload, isUploading }: { onUpload: () => void; isUploading: boolean }) => (
  <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
    <div className="max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-[#8fb5ff]">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-50">还没有知识文档</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">上传运维手册、故障复盘或处置流程后，Agent 可以在回答和告警分析中检索这些内部知识。</p>
      <button
        type="button"
        onClick={onUpload}
        disabled={isUploading}
        className="brand-button mt-5 h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        上传第一份文档
      </button>
    </div>
  </div>
);

const DocumentRow = ({
  doc,
  pendingAction,
  confirmDeleteId,
  onReindex,
  onToggleEnabled,
  onDelete,
  onCancelTask,
  onCleanup,
  onCancelDelete,
}: {
  doc: KnowledgeDocument;
  pendingAction: PendingAction | null;
  confirmDeleteId: string | null;
  onReindex: (documentId: string) => void;
  onToggleEnabled: (doc: KnowledgeDocument) => void;
  onDelete: (documentId: string) => void;
  onCancelTask: (doc: KnowledgeDocument) => void;
  onCleanup: (documentId: string) => void;
  onCancelDelete: () => void;
}) => {
  const isActive = isActiveDocument(doc);
  const isReindexing = pendingAction?.documentId === doc.id && pendingAction.type === 'reindex';
  const isDeleting = pendingAction?.documentId === doc.id && pendingAction.type === 'delete';
  const isCanceling = pendingAction?.documentId === doc.id && pendingAction.type === 'cancel';
  const isCleaning = pendingAction?.documentId === doc.id && pendingAction.type === 'cleanup';
  const isToggling = pendingAction?.documentId === doc.id && pendingAction.type === 'toggle';
  const isConfirmingDelete = confirmDeleteId === doc.id;

  return (
    <article className="grid gap-3 bg-white/[0.04] px-4 py-4 lg:grid-cols-[minmax(220px,1.5fr)_110px_96px_120px_156px_132px] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4f8cff]/12 text-[#8fb5ff]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-50">{doc.fileName}</h3>
            <p className="mt-1 truncate text-xs text-slate-400">{doc.filePath}</p>
            <p className={`mt-2 text-xs font-semibold ${doc.enabled ? 'text-[#c3d7ff]' : 'text-slate-400'}`}>
              {doc.enabled ? '参与检索' : '已禁用检索'}
            </p>
            {doc.lastError && <p className="mt-2 line-clamp-2 text-xs leading-5 text-red-200">{doc.lastError}</p>}
          </div>
        </div>
      </div>
      <InfoCell label="大小" value={formatBytes(doc.size)} />
      <div>
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${statusStyle[doc.status]}`}>
          {isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : doc.status === 'ready' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {statusLabel[doc.status]}
        </span>
      </div>
      <InfoCell label="片段" value={`${doc.chunkCount} chunks`} />
      <InfoCell label="更新" value={formatDate(doc.updatedAt)} icon={Clock3} />
      <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => onToggleEnabled(doc)}
          disabled={isActive || isReindexing || isDeleting || isCanceling || isCleaning || isToggling}
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            doc.enabled
              ? 'border-emerald-400/20 bg-[#4f8cff]/10 text-[#c3d7ff] hover:bg-emerald-100'
              : 'border-white/10 bg-white/[0.04] text-slate-400 hover:bg-slate-100'
          }`}
        >
          {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : doc.enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
          {doc.enabled ? '启用' : '禁用'}
        </button>
        {isCancelableDocument(doc) && (
          <button
            type="button"
            onClick={() => onCancelTask(doc)}
            disabled={!doc.activeTaskId || isCanceling || isDeleting}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-amber-300 bg-amber-400/10 px-2.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCanceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            取消
          </button>
        )}
        <button
          type="button"
          onClick={() => onReindex(doc.id)}
          disabled={isActive || isReindexing || isDeleting || isCanceling || isCleaning}
          className="brand-subtle-button inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReindexing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          重建
        </button>
        {isCleanableDocument(doc) && (
          <button
            type="button"
            onClick={() => onCleanup(doc.id)}
            disabled={isActive || isReindexing || isDeleting || isCanceling || isCleaning}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-red-200 bg-red-400/10 px-2.5 text-xs font-semibold text-red-200 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCleaning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldX className="h-3.5 w-3.5" />}
            清理索引
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          disabled={isActive || isReindexing || isDeleting || isCanceling || isCleaning}
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isConfirmingDelete
              ? 'border-red-300 bg-red-400/10 text-red-200 hover:bg-red-100'
              : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-red-300 hover:bg-red-400/10 hover:text-red-200'
          }`}
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          {isConfirmingDelete ? '确认' : '删除'}
        </button>
        {isConfirmingDelete && (
          <button
            type="button"
            onClick={onCancelDelete}
            className="brand-text-link h-9 cursor-pointer rounded px-1 text-xs font-semibold"
          >
            取消
          </button>
        )}
      </div>
    </article>
  );
};

const InfoCell = ({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Clock3 }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold text-slate-400 lg:hidden">{label}</p>
    <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-slate-300 lg:mt-0">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
      <span className="truncate">{value}</span>
    </p>
  </div>
);

const RuleItem = ({ icon: Icon, text }: { icon: typeof FileText; text: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 shrink-0 text-[#8fb5ff]" />
    <span>{text}</span>
  </div>
);

export default KnowledgePage;

