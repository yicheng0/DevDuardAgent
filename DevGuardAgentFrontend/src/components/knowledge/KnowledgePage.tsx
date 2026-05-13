import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Loader2,
  RefreshCcw,
  RotateCcw,
  SearchCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { KnowledgeDocument, KnowledgeTask, KnowledgeUploadResult } from '@/types';

type ApiResponse<T> = {
  message: string;
  data: T;
};

type PendingAction = {
  documentId: string;
  type: 'reindex' | 'delete';
};

const acceptedExtensions = '.md,.markdown,.txt';

const statusLabel: Record<KnowledgeDocument['status'], string> = {
  indexing: '索引中',
  ready: '可检索',
  failed: '索引失败',
  delete_failed: '删除失败',
  deleted: '已删除',
};

const statusStyle: Record<KnowledgeDocument['status'], string> = {
  indexing: 'border-amber-200 bg-amber-50 text-amber-700',
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
  delete_failed: 'border-red-200 bg-red-50 text-red-700',
  deleted: 'border-slate-200 bg-slate-50 text-slate-500',
};

const request = async <T,>(url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  const rawBody = await response.text();
  let body: ApiResponse<T> | null = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as ApiResponse<T>;
    } catch {
      if (response.status === 404) {
        throw new Error('知识库接口未找到，请确认后端已重启并包含 /api/knowledge 路由。');
      }
      throw new Error(`接口返回非 JSON 响应：${response.status} ${rawBody}`);
    }
  }

  if (!body) {
    if (response.status === 404) {
      throw new Error('知识库接口未找到，请确认后端已重启并包含 /api/knowledge 路由。');
    }
    throw new Error(`接口无响应内容：${response.status}`);
  }

  if (!response.ok || body.message !== 'OK') {
    throw new Error(body.message || '请求失败');
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

const isActiveDocument = (doc: KnowledgeDocument) => doc.status === 'indexing' || Boolean(doc.activeTaskId);

const KnowledgePage = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [latestTask, setLatestTask] = useState<KnowledgeTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveTasks = documents.some(isActiveDocument);

  const stats = useMemo(() => {
    const ready = documents.filter((doc) => doc.status === 'ready').length;
    const indexing = documents.filter((doc) => doc.status === 'indexing').length;
    const failed = documents.filter((doc) => doc.status === 'failed' || doc.status === 'delete_failed').length;
    const chunks = documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
    return { ready, indexing, failed, chunks };
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

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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

  const activeTaskLabel = latestTask
    ? `${latestTask.type} · ${latestTask.status} · ${formatDate(latestTask.updatedAt)}`
    : hasActiveTasks
      ? '有任务正在执行'
      : '当前无运行任务';

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50 p-3 xl:overflow-hidden">
      <div className="grid h-full min-h-[760px] gap-3 xl:grid-cols-[minmax(620px,1fr)_320px]">
        <main className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="shrink-0 border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#ead1c5] bg-[#fbf7f4] px-2.5 py-1 text-xs font-semibold text-[#7f432f]">
                  <Database className="h-3.5 w-3.5" />
                  Knowledge Base
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-950">知识库管理</h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  管理 Agent 可检索的运维手册、复盘材料和内部处置经验。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadDocuments()}
                  disabled={isLoading || isUploading}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  刷新
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

          <section className="grid shrink-0 gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
            <StatCard label="可检索文档" value={stats.ready} tone="emerald" />
            <StatCard label="索引中" value={stats.indexing} tone="amber" />
            <StatCard label="异常文档" value={stats.failed} tone="red" />
            <StatCard label="知识片段" value={stats.chunks} tone="slate" />
          </section>

          {(error || success) && (
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && !error && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在读取知识库
              </div>
            ) : documents.length === 0 ? (
              <EmptyState onUpload={() => fileInputRef.current?.click()} isUploading={isUploading} />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="hidden grid-cols-[minmax(220px,1.5fr)_110px_96px_120px_156px_132px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 lg:grid">
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
                      onDelete={handleDelete}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:min-h-0">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <SearchCheck className="h-4 w-4 text-[#9a563f]" />
              运行状态
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">索引任务会自动轮询刷新，完成后停止。</p>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                {hasActiveTasks ? <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {hasActiveTasks ? '任务执行中' : '任务空闲'}
              </div>
              <p className="mt-2 break-all text-xs leading-5 text-slate-600">{activeTaskLabel}</p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-950">上传规则</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <RuleItem icon={FileText} text="支持 TXT、MD、Markdown 文件" />
                <RuleItem icon={Database} text="同内容文件会按 hash 去重" />
                <RuleItem icon={RotateCcw} text="重建会替换旧向量片段" />
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
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
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone: StatTone }) => (
  <div className={`rounded-lg border bg-white p-3 ${statToneClass[tone]}`}>
    <p className="text-xs font-semibold opacity-80">{label}</p>
    <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
  </div>
);

const EmptyState = ({ onUpload, isUploading }: { onUpload: () => void; isUploading: boolean }) => (
  <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
    <div className="max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#ead1c5] bg-[#fbf7f4] text-[#7f432f]">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">还没有知识文档</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">上传运维手册、故障复盘或处置流程后，Agent 可以在回答和告警分析中检索这些内部知识。</p>
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
  onDelete,
  onCancelDelete,
}: {
  doc: KnowledgeDocument;
  pendingAction: PendingAction | null;
  confirmDeleteId: string | null;
  onReindex: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  onCancelDelete: () => void;
}) => {
  const isActive = isActiveDocument(doc);
  const isReindexing = pendingAction?.documentId === doc.id && pendingAction.type === 'reindex';
  const isDeleting = pendingAction?.documentId === doc.id && pendingAction.type === 'delete';
  const isConfirmingDelete = confirmDeleteId === doc.id;

  return (
    <article className="grid gap-3 bg-white px-4 py-4 lg:grid-cols-[minmax(220px,1.5fr)_110px_96px_120px_156px_132px] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7ebe5] text-[#7f432f]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">{doc.fileName}</h3>
            <p className="mt-1 truncate text-xs text-slate-500">{doc.filePath}</p>
            {doc.lastError && <p className="mt-2 line-clamp-2 text-xs leading-5 text-red-700">{doc.lastError}</p>}
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
          onClick={() => onReindex(doc.id)}
          disabled={isActive || isReindexing || isDeleting}
          className="brand-subtle-button inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReindexing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          重建
        </button>
        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          disabled={isActive || isReindexing || isDeleting}
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isConfirmingDelete
              ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
              : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
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
    <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-slate-700 lg:mt-0">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
      <span className="truncate">{value}</span>
    </p>
  </div>
);

const RuleItem = ({ icon: Icon, text }: { icon: typeof FileText; text: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 shrink-0 text-[#9a563f]" />
    <span>{text}</span>
  </div>
);

export default KnowledgePage;
