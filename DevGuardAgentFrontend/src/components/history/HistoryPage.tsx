import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import { AgentTask, AgentTaskStatus, AIOpsStep } from '@/types';
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
  running: 'border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#c3d7ff]',
  succeeded: 'border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#c3d7ff]',
  failed: 'border-red-400/20 bg-red-400/10 text-red-200',
};

const statusIcon: Record<AgentTaskStatus, typeof Clock3> = {
  running: Loader2,
  succeeded: CheckCircle2,
  failed: XCircle,
};

const stepStatusLabel: Record<AIOpsStep['status'], string> = {
  pending: '等待',
  running: '运行中',
  completed: '完成',
  error: '异常',
};

const riskLabel: Record<NonNullable<AIOpsStep['riskLevel']>, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '严重',
};

const request = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiResponse<T>)
    : ({ message: await response.text(), data: undefined as T } as ApiResponse<T>);

  if (!response.ok) {
    throw new Error(`GET ${url} 返回 ${response.status}：${body.message || response.statusText}`);
  }
  if (body.message !== 'OK') {
    throw new Error(`GET ${url} 失败：${body.message || '后端返回异常'}`);
  }
  return body.data;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatDuration = (durationMs?: number) => {
  if (!durationMs) return '';
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
};

const HistoryPage = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<AgentTask | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionTaskId, setActionTaskId] = useState('');
  const [error, setError] = useState('');
  const { sessions, switchSession, restoreSessionFromTask, updateMessageImportant } = useChatStore();
  const { setActiveNav } = useUIStore();

  const listSelectedTask = tasks.find((task) => task.id === selectedId) || tasks[0] || null;
  const selectedTask =
    selectedTaskDetail && selectedTaskDetail.id === selectedId
      ? selectedTaskDetail
      : listSelectedTask;

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      running: tasks.filter((task) => task.status === 'running').length,
      succeeded: tasks.filter((task) => task.status === 'succeeded').length,
      failed: tasks.filter((task) => task.status === 'failed').length,
    };
  }, [tasks]);

  const loadTaskDetail = useCallback(async (taskId: string, silent = false) => {
    if (!taskId) return;
    if (!silent) {
      setIsDetailLoading(true);
      setError('');
    }
    try {
      const data = await request<{ task: AgentTask }>(
        `/api/tasks/detail?id=${encodeURIComponent(taskId)}`
      );
      setSelectedTaskDetail(data.task);
      setTasks((current) =>
        current.map((task) => (task.id === data.task.id ? data.task : task))
      );
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : '任务详情加载失败');
      }
    } finally {
      if (!silent) setIsDetailLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError('');
    }
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (status !== 'all') params.set('status', status);
      params.set('limit', '100');

      const data = await request<{ tasks: AgentTask[] }>(`/api/tasks?${params.toString()}`);
      const nextTasks = data.tasks || [];
      const nextSelectedId =
        selectedId && nextTasks.some((task) => task.id === selectedId)
          ? selectedId
          : nextTasks[0]?.id || '';

      setTasks(nextTasks);
      setSelectedId(nextSelectedId);
      if (nextSelectedId) {
        void loadTaskDetail(nextSelectedId, true);
      } else {
        setSelectedTaskDetail(null);
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : '任务记录加载失败');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [keyword, loadTaskDetail, selectedId, status]);

  useEffect(() => {
    void loadTasks();
    // Initial load only; filters are applied by the explicit button or Enter key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tasks.some((task) => task.status === 'running')) return;
    const timer = window.setInterval(() => {
      void loadTasks(true);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadTasks, tasks]);

  const selectTask = (task: AgentTask) => {
    setSelectedId(task.id);
    setSelectedTaskDetail(task);
    void loadTaskDetail(task.id);
  };

  const openSession = (task: AgentTask) => {
    if (sessions.some((session) => session.id === task.sessionId)) {
      switchSession(task.sessionId);
    } else {
      restoreSessionFromTask(task);
    }
    setActiveNav('overview');
  };

  const toggleImportant = async (task: AgentTask) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    setActionTaskId(task.id);
    setError('');
    try {
      const response = await fetch('/api/tasks/important', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, important: !task.important }),
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? ((await response.json()) as ApiResponse<{ task: AgentTask }>)
        : ({ message: await response.text(), data: undefined as unknown as { task: AgentTask } } as ApiResponse<{ task: AgentTask }>);
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || '标记重要失败');
      }
      const updatedTask = body.data.task;
      setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
      setSelectedTaskDetail(updatedTask);
      updateMessageImportant(updatedTask.id, Boolean(updatedTask.important));
    } catch (err) {
      setError(err instanceof Error ? err.message : '标记重要失败');
    } finally {
      window.clearTimeout(timeout);
      setActionTaskId('');
    }
  };

  const deleteTask = async (task: AgentTask) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    setActionTaskId(task.id);
    setError('');
    try {
      const response = await fetch(`/api/tasks?id=${encodeURIComponent(task.id)}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? ((await response.json()) as ApiResponse<{ task: AgentTask }>)
        : ({ message: await response.text(), data: undefined as unknown as { task: AgentTask } } as ApiResponse<{ task: AgentTask }>);
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || '删除任务失败');
      }
      const nextTasks = tasks.filter((item) => item.id !== task.id);
      setTasks(nextTasks);
      const nextSelectedId = nextTasks[0]?.id || '';
      setSelectedId(nextSelectedId);
      setSelectedTaskDetail(null);
      if (nextSelectedId) void loadTaskDetail(nextSelectedId, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除任务失败');
    } finally {
      window.clearTimeout(timeout);
      setActionTaskId('');
    }
  };

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[minmax(440px,0.82fr)_minmax(520px,1.18fr)] xl:gap-3 xl:overflow-hidden">
      <section className="app-surface mb-3 flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-white/10 shadow-[0_14px_30px_rgba(3,8,20,0.2)] xl:mb-0 xl:min-h-0">
        <div className="border-b border-white/10 p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-semibold text-slate-50">
                <Clock3 className="h-5 w-5 text-[#8fb5ff]" />
                任务历史
              </h1>
              <p className="mt-1 text-sm text-slate-400">回看 Agent 对话任务、Trace 阶段和最终处置答复。</p>
            </div>
            <button
              type="button"
              onClick={() => loadTasks()}
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
              <div key={label} className="app-surface-muted rounded-lg border border-white/10 p-3">
                <p className="text-lg font-semibold text-slate-50">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
            <label className="brand-focus-within flex h-10 min-w-0 items-center gap-2 rounded-md border border-white/10 bg-[#0f1f38] px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void loadTasks();
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
                placeholder="搜索问题、答复或 Trace ID"
              />
            </label>
            <div className="grid grid-cols-4 overflow-hidden rounded-md border border-white/10 bg-[#0f1f38]">
              {(['all', 'running', 'succeeded', 'failed'] as StatusFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`h-10 cursor-pointer text-xs font-semibold transition-all ${
                    status === item
                      ? 'bg-[#4f8cff] text-white shadow-[inset_0_0_0_1px_rgba(79,140,255,0.22),0_8px_18px_rgba(3,8,20,0.24)]'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                  }`}
                >
                  {item === 'all' ? '全部' : statusLabel[item]}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => loadTasks()} className="brand-button mt-3 h-10 w-full text-sm">
            <Search className="h-4 w-4" />
            应用筛选
          </button>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {isLoading && tasks.length === 0 && (
            <div className="flex min-h-[360px] items-center justify-center text-center">
              <div>
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#8fb5ff]" />
                <p className="mt-3 text-sm font-semibold text-slate-50">正在加载任务记录</p>
              </div>
            </div>
          )}

          {!isLoading && tasks.length === 0 && (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0f1f38] p-8 text-center">
              <div className="max-w-sm">
                <FileText className="mx-auto h-10 w-10 text-[#8fb5ff]" />
                <p className="mt-4 text-base font-semibold text-slate-50">暂无任务记录</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">发送一次 Agent 对话后，这里会展示任务执行历史。</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map((task) => {
              const Icon = statusIcon[task.status];
              const isActive = selectedTask?.id === task.id;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => selectTask(task)}
                  className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-all ${
                    isActive
                      ? 'border-[#4f8cff]/50 bg-[#4f8cff]/10 shadow-[0_8px_22px_rgba(3,8,20,0.16)]'
                      : 'border-white/10 bg-[#0f1f38] hover:border-[#4f8cff]/30 hover:bg-[#0f1f38]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-50">{task.title || '未命名任务'}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{task.question || '无问题内容'}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${statusStyle[task.status]}`}>
                      <Icon className={`h-3.5 w-3.5 ${task.status === 'running' ? 'animate-spin' : ''}`} />
                      {statusLabel[task.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{task.mode === 'stream' ? '流式' : '快速'}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatDate(task.updatedAt)}</span>
                    {task.steps?.length ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{task.steps.length} 个阶段</span>
                      </>
                    ) : null}
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
              <Route className="mx-auto h-10 w-10 text-[#8fb5ff]" />
              <p className="mt-4 text-base font-semibold text-slate-50">选择一条任务记录</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">详情会展示执行阶段、错误信息和最终答复。</p>
              </div>
            </div>
          ) : (
          <>
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-50">
                    <MessageSquareText className="h-5 w-5 text-[#8fb5ff]" />
                    {selectedTask.title || '未命名任务'}
                  </h2>
                  <p className="mt-1 break-all text-xs text-slate-400">Trace: {selectedTask.traceId || '-'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openSession(selectedTask)}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold"
                >
                  <MessageSquareText className="h-4 w-4" />
                  打开会话
                </button>
                <button
                  type="button"
                  onClick={() => toggleImportant(selectedTask)}
                  disabled={actionTaskId === selectedTask.id}
                  className={`brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:opacity-60 ${
                    selectedTask.important ? 'border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#c3d7ff]' : ''
                  }`}
                >
                  {actionTaskId === selectedTask.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className={`h-4 w-4 ${selectedTask.important ? 'fill-current' : ''}`} />
                  )}
                  {selectedTask.important ? '已重要' : '重要'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteTask(selectedTask)}
                  disabled={actionTaskId === selectedTask.id}
                  className="brand-subtle-button inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold text-red-200 disabled:opacity-60"
                >
                  {actionTaskId === selectedTask.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  删除
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {isDetailLoading && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0f1f38] px-3 py-2 text-sm text-[#8fb5ff]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在刷新任务详情
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <div className={`rounded-lg border p-3 ${statusStyle[selectedTask.status]}`}>
                  <p className="text-xs font-semibold">状态</p>
                  <p className="mt-1 text-base font-semibold">{statusLabel[selectedTask.status]}</p>
                </div>
                <div className="app-surface-muted rounded-lg border p-3">
                  <p className="text-xs font-semibold text-slate-400">开始时间</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">{formatDate(selectedTask.startedAt)}</p>
                </div>
                <div className="app-surface-muted rounded-lg border p-3">
                  <p className="text-xs font-semibold text-slate-400">完成时间</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">{formatDate(selectedTask.finishedAt)}</p>
                </div>
              </div>

              <section className="app-surface-muted mt-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-slate-50">用户问题</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                  {selectedTask.question || '无问题内容'}
                </p>
              </section>

              {selectedTask.error && (
                <section className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-4">
                  <h3 className="text-sm font-semibold text-red-200">错误信息</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-red-100">{selectedTask.error}</p>
                </section>
              )}

              <section className="app-surface mt-4 rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-50">
                  <Route className="h-4 w-4 text-[#8fb5ff]" />
                  Trace 阶段
                </h3>
                {selectedTask.steps?.length ? (
                  <div className="space-y-3">
                    {selectedTask.steps.map((step) => (
                      <article key={step.id} className="app-surface-muted rounded-lg border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-50">{step.title}</p>
                          <span className="rounded-md bg-[#0f1f38] px-2 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                            {stepStatusLabel[step.status] || step.status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                          {step.phase && <span className="rounded-md bg-[#0f1f38] px-2 py-1 ring-1 ring-white/10">阶段：{step.phase}</span>}
                          {step.toolName && <span className="rounded-md bg-[#0f1f38] px-2 py-1 ring-1 ring-white/10">工具：{step.toolName}</span>}
                          {step.durationMs ? <span className="rounded-md bg-[#0f1f38] px-2 py-1 ring-1 ring-white/10">耗时：{formatDuration(step.durationMs)}</span> : null}
                          {step.riskLevel && <span className="rounded-md bg-[#0f1f38] px-2 py-1 ring-1 ring-white/10">风险：{riskLabel[step.riskLevel]}</span>}
                        </div>
                        {step.description && <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>}
                        {step.result && <p className="mt-2 text-sm leading-6 text-slate-200">{step.result}</p>}
                        {step.evidence?.length ? (
                          <div className="mt-3 space-y-1">
                            {step.evidence.map((item) => (
                              <p key={item} className="break-words rounded-md bg-[#0f1f38] px-2 py-1 text-xs leading-5 text-slate-300 ring-1 ring-white/10">
                                {item}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">暂无 Trace 阶段数据。</p>
                )}
              </section>

              <section className="app-surface mt-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-slate-50">最终答复</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
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

