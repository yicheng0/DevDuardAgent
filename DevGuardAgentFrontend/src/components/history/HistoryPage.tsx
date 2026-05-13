import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Route,
  Search,
  XCircle,
} from 'lucide-react';
import { AgentTask, AgentTaskStatus } from '@/types';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';

type ApiResponse<T> = {
  message: string;
  data: T;
};

type StatusFilter = 'all' | AgentTaskStatus;

const statusLabel: Record<AgentTaskStatus, string> = {
  running: '运行中',
  succeeded: '成功',
  failed: '失败',
};

const statusStyle: Record<AgentTaskStatus, string> = {
  running: 'border-amber-200 bg-amber-50 text-amber-700',
  succeeded: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
};

const statusIcon: Record<AgentTaskStatus, typeof Clock3> = {
  running: Loader2,
  succeeded: CheckCircle2,
  failed: XCircle,
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const HistoryPage = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sessions, switchSession } = useChatStore();
  const { setActiveNav } = useUIStore();

  const selectedTask = tasks.find((task) => task.id === selectedId) || tasks[0] || null;

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      running: tasks.filter((task) => task.status === 'running').length,
      succeeded: tasks.filter((task) => task.status === 'succeeded').length,
      failed: tasks.filter((task) => task.status === 'failed').length,
    };
  }, [tasks]);

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (status !== 'all') params.set('status', status);
      params.set('limit', '100');

      const response = await fetch(`/api/tasks?${params.toString()}`);
      const body = (await response.json()) as ApiResponse<{ tasks: AgentTask[] }>;
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || `HTTP ${response.status}`);
      }
      setTasks(body.data.tasks || []);
      setSelectedId((current) => {
        if (current && body.data.tasks?.some((task) => task.id === current)) return current;
        return body.data.tasks?.[0]?.id || '';
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '任务记录加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openSession = (sessionId: string) => {
    if (sessions.some((session) => session.id === sessionId)) {
      switchSession(sessionId);
      setActiveNav('overview');
    }
  };

  const canOpenSession = selectedTask
    ? sessions.some((session) => session.id === selectedTask.sessionId)
    : false;

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[minmax(440px,0.82fr)_minmax(520px,1.18fr)] xl:gap-3 xl:overflow-hidden">
      <section className="app-surface mb-3 flex min-h-[620px] flex-col overflow-hidden rounded-lg border shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-[#ead7b7] p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                <Clock3 className="h-5 w-5 text-[#9a563f]" />
                任务历史
              </h1>
              <p className="mt-1 text-sm text-slate-500">回看 Agent 对话任务、Trace 阶段和最终处置答复。</p>
            </div>
            <button
              type="button"
              onClick={loadTasks}
              disabled={isLoading}
              className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              刷新
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              ['全部', stats.total],
              ['运行中', stats.running],
              ['成功', stats.succeeded],
              ['失败', stats.failed],
            ].map(([label, value]) => (
              <div key={label} className="app-surface-muted rounded-lg border p-3">
                <p className="text-lg font-semibold text-slate-950">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
            <label className="brand-focus-within flex h-10 min-w-0 items-center gap-2 rounded-md border border-[#ead7b7] bg-[#fffdf8] px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') loadTasks();
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="搜索问题、答复或 Trace ID"
              />
            </label>
            <div className="grid grid-cols-4 overflow-hidden rounded-md border border-[#ead7b7] bg-[#fff6e8]">
              {(['all', 'running', 'succeeded', 'failed'] as StatusFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`h-10 cursor-pointer text-xs font-semibold transition-colors ${
                    status === item ? 'bg-[#f7ebe5] text-[#7f432f]' : 'text-slate-500 hover:bg-[#fffdf8]'
                  }`}
                >
                  {item === 'all' ? '全部' : statusLabel[item]}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={loadTasks} className="brand-button mt-3 h-10 w-full text-sm">
            <Search className="h-4 w-4" />
            应用筛选
          </button>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {isLoading && tasks.length === 0 && (
            <div className="flex min-h-[360px] items-center justify-center text-center">
              <div>
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#9a563f]" />
                <p className="mt-3 text-sm font-semibold text-slate-950">正在加载任务记录</p>
              </div>
            </div>
          )}

          {!isLoading && tasks.length === 0 && (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[#dec39d] bg-[#fff6e8] p-8 text-center">
              <div className="max-w-sm">
                <FileText className="mx-auto h-10 w-10 text-[#9a563f]" />
                <p className="mt-4 text-base font-semibold text-slate-950">暂无任务记录</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">发送一次 Agent 对话后，这里会展示任务执行历史。</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map((task) => {
              const Icon = statusIcon[task.status];
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedId(task.id)}
                  className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                    selectedTask?.id === task.id
                      ? 'border-[#d9a08a] bg-[#fbf7f4]'
                      : 'border-[#ead7b7] bg-[#fffdf8] hover:border-[#ead1c5] hover:bg-[#fff6e8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{task.title || '未命名任务'}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{task.question || '无问题内容'}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${statusStyle[task.status]}`}>
                      <Icon className={`h-3.5 w-3.5 ${task.status === 'running' ? 'animate-spin' : ''}`} />
                      {statusLabel[task.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{task.mode === 'stream' ? '流式' : '快速'}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="app-surface flex min-h-[620px] flex-col overflow-hidden rounded-lg border shadow-sm xl:min-h-0">
        {!selectedTask ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <Route className="mx-auto h-10 w-10 text-[#9a563f]" />
              <p className="mt-4 text-base font-semibold text-slate-950">选择一条任务记录</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">详情会展示执行阶段、错误信息和最终答复。</p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-[#ead7b7] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <MessageSquareText className="h-5 w-5 text-[#9a563f]" />
                    {selectedTask.title || '未命名任务'}
                  </h2>
                  <p className="mt-1 break-all text-xs text-slate-500">Trace: {selectedTask.traceId || '-'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openSession(selectedTask.sessionId)}
                  disabled={!canOpenSession}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageSquareText className="h-4 w-4" />
                  打开会话
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className={`rounded-lg border p-3 ${statusStyle[selectedTask.status]}`}>
                  <p className="text-xs font-semibold">状态</p>
                  <p className="mt-1 text-base font-semibold">{statusLabel[selectedTask.status]}</p>
                </div>
                <div className="app-surface-muted rounded-lg border p-3">
                  <p className="text-xs font-semibold text-slate-500">开始时间</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(selectedTask.startedAt)}</p>
                </div>
                <div className="app-surface-muted rounded-lg border p-3">
                  <p className="text-xs font-semibold text-slate-500">完成时间</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(selectedTask.finishedAt)}</p>
                </div>
              </div>

              <section className="app-surface-muted mt-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-slate-950">用户问题</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {selectedTask.question || '无问题内容'}
                </p>
              </section>

              {selectedTask.error && (
                <section className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="text-sm font-semibold text-red-800">错误信息</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-red-700">{selectedTask.error}</p>
                </section>
              )}

              <section className="app-surface mt-4 rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Route className="h-4 w-4 text-[#9a563f]" />
                  Trace 阶段
                </h3>
                {selectedTask.steps?.length ? (
                  <div className="space-y-3">
                    {selectedTask.steps.map((step) => (
                      <article key={step.id} className="app-surface-muted rounded-lg border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-950">{step.title}</p>
                          <span className="rounded-md bg-[#fffdf8] px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-[#ead7b7]">
                            {step.status}
                          </span>
                        </div>
                        {step.description && <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>}
                        {step.result && <p className="mt-2 text-sm leading-6 text-slate-700">{step.result}</p>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">暂无 Trace 阶段数据。</p>
                )}
              </section>

              <section className="app-surface mt-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-slate-950">最终答复</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {selectedTask.answer || '暂无最终答复。'}
                </p>
              </section>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HistoryPage;
