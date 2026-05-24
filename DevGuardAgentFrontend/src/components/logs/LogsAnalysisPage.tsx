import { FormEvent, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock3,
  FileSearch,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
  Server,
  TerminalSquare,
} from 'lucide-react';
import { LogAnalyzeRequest, LogAnalyzeResult } from '@/types';

type ApiResponse<T> = {
  message: string;
  data: T;
};

type TimePreset = '15m' | '1h' | '6h' | 'custom';

const pad = (value: number) => value.toString().padStart(2, '0');

const toLocalInputValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toRFC3339 = (value: string) => {
  if (!value) return '';
  return new Date(value).toISOString();
};

const getPresetRange = (preset: TimePreset) => {
  const end = new Date();
  const start = new Date(end);
  if (preset === '15m') start.setMinutes(start.getMinutes() - 15);
  if (preset === '1h') start.setHours(start.getHours() - 1);
  if (preset === '6h') start.setHours(start.getHours() - 6);
  return {
    start: toLocalInputValue(start),
    end: toLocalInputValue(end),
  };
};

const initialRange = getPresetRange('1h');

const fieldClass =
  'brand-input h-10 w-full rounded-md border px-3 text-sm text-slate-100 placeholder:text-slate-500';

const LogsAnalysisPage = () => {
  const [region, setRegion] = useState('ap-guangzhou');
  const [topicId, setTopicId] = useState('');
  const [query, setQuery] = useState('error');
  const [limit, setLimit] = useState(100);
  const [preset, setPreset] = useState<TimePreset>('1h');
  const [startTime, setStartTime] = useState(initialRange.start);
  const [endTime, setEndTime] = useState(initialRange.end);
  const [result, setResult] = useState<LogAnalyzeResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = region.trim() && topicId.trim() && query.trim() && !isLoading;

  const queryWindow = useMemo(() => {
    if (!result) return '未查询';
    return `${new Date(result.startedAt).toLocaleString()} - ${new Date(result.endedAt).toLocaleString()}`;
  }, [result]);

  const applyPreset = (next: TimePreset) => {
    setPreset(next);
    if (next === 'custom') return;
    const range = getPresetRange(next);
    setStartTime(range.start);
    setEndTime(range.end);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload: LogAnalyzeRequest = {
        region: region.trim(),
        topicId: topicId.trim(),
        query: query.trim(),
        startTime: toRFC3339(startTime),
        endTime: toRFC3339(endTime),
        limit,
      };
      const response = await fetch('/api/logs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ApiResponse<LogAnalyzeResult>;
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || `HTTP ${response.status}`);
      }
      setResult(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '日志分析失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const range = getPresetRange('1h');
    setRegion('ap-guangzhou');
    setTopicId('');
    setQuery('error');
    setLimit(100);
    setPreset('1h');
    setStartTime(range.start);
    setEndTime(range.end);
    setResult(null);
    setError('');
  };

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[minmax(560px,1fr)_340px] xl:gap-3 xl:overflow-hidden">
      <main className="app-surface mb-3 flex min-h-[680px] flex-col overflow-hidden rounded-lg border shadow-[0_14px_30px_rgba(3,8,20,0.2)] xl:mb-0 xl:min-h-0">
        <form onSubmit={handleSubmit} className="border-b border-white/10 bg-[#0c1728] p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-semibold text-slate-50">
                <TerminalSquare className="h-5 w-5 text-[#8fb5ff]" />
                实时日志分析
              </h1>
              <p className="mt-1 text-sm text-slate-400">通过 MCP 日志服务查询运行态日志，并生成异常模式摘要。</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="brand-subtle-button inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </button>
              <button type="submit" disabled={!canSubmit} className="brand-button h-10 px-4 text-sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isLoading ? '分析中' : '查询分析'}
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">地域</span>
              <input value={region} onChange={(event) => setRegion(event.target.value)} className={fieldClass} placeholder="ap-guangzhou" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">日志主题 ID</span>
              <input value={topicId} onChange={(event) => setTopicId(event.target.value)} className={fieldClass} placeholder="869830db-a055-4479-963b-3c898d27e755" />
            </label>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_160px]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">查询语句</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={fieldClass} placeholder='panic OR error OR "region mismatch"' />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">返回条数</span>
              <input type="number" min={1} max={500} value={limit} onChange={(event) => setLimit(Number(event.target.value))} className={fieldClass} />
            </label>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[220px_1fr_1fr]">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">时间范围</span>
              <div className="grid grid-cols-4 overflow-hidden rounded-md border border-white/10 bg-[#0f1f38]">
                {(['15m', '1h', '6h', 'custom'] as TimePreset[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => applyPreset(item)}
                    className={`h-10 text-xs font-semibold transition-colors ${preset === item ? 'bg-[#4f8cff] text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'}`}
                  >
                    {item === 'custom' ? '自定' : item}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">开始时间</span>
              <input type="datetime-local" value={startTime} onChange={(event) => { setPreset('custom'); setStartTime(event.target.value); }} className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">结束时间</span>
              <input type="datetime-local" value={endTime} onChange={(event) => { setPreset('custom'); setEndTime(event.target.value); }} className={fieldClass} />
            </label>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!result && !isLoading && (
            <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0f1f38] p-8 text-center">
              <div className="max-w-md">
                <FileSearch className="mx-auto h-11 w-11 text-[#8fb5ff]" />
                <p className="mt-4 text-base font-semibold text-slate-50">填写日志条件后开始分析</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">建议先使用最近 1 小时窗口，关键词聚焦接口名、错误码或异常短语。</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="app-surface-muted flex min-h-[420px] items-center justify-center rounded-lg border p-8 text-center">
              <div>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#8fb5ff]" />
                <p className="mt-4 text-base font-semibold text-slate-50">正在查询 MCP 日志并生成报告</p>
                <p className="mt-2 text-sm text-slate-400">大时间窗口或高返回条数可能需要更久。</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              <section className="app-surface-muted rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-50">
                  <Activity className="h-4 w-4 text-[#8fb5ff]" />
                  分析摘要
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{result.summary}</p>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="app-surface rounded-lg border p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-50">
                    <ListFilter className="h-4 w-4 text-[#8fb5ff]" />
                    异常模式
                  </h2>
                  {result.patterns.length > 0 ? (
                    <div className="space-y-2">
                      {result.patterns.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-md bg-[#0f1f38] px-3 py-2 text-sm leading-6 text-slate-300 ring-1 ring-white/10">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">未识别出明确异常模式。</p>
                  )}
                </div>

                <div className="app-surface rounded-lg border p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-50">
                    <Search className="h-4 w-4 text-[#8fb5ff]" />
                    下一步建议
                  </h2>
                  {result.suggestions.length > 0 ? (
                    <div className="space-y-2">
                      {result.suggestions.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-md bg-[#0f1f38] px-3 py-2 text-sm leading-6 text-slate-300 ring-1 ring-white/10">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">暂无建议。</p>
                  )}
                </div>
              </section>

              <section className="app-surface rounded-lg border p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-50">
                  <TerminalSquare className="h-4 w-4 text-[#8fb5ff]" />
                  关键日志样例
                </h2>
                {result.samples.length > 0 ? (
                  <div className="space-y-3">
                    {result.samples.map((sample, index) => (
                      <article key={`${sample.message}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {sample.timestamp && <span>{sample.timestamp}</span>}
                          {sample.level && <span className="rounded bg-slate-800 px-1.5 py-0.5 font-semibold text-orange-200">{sample.level}</span>}
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-xs leading-5">{sample.message}</pre>
                      </article>
                    ))}
                  </div>
                ) : (
                    <p className="text-sm text-slate-400">没有可展示的日志样例。</p>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <aside className="app-surface flex min-h-[560px] flex-col overflow-hidden rounded-lg border shadow-sm xl:min-h-0">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-50">查询上下文</h2>
          <p className="mt-0.5 text-xs text-slate-400">MCP 工具、时间窗口和原始结果</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid gap-3">
            <div className="app-surface-muted rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Server className="h-4 w-4 text-[#8fb5ff]" />
                MCP 工具
              </div>
              <p className="truncate text-sm font-semibold text-slate-50">{result?.toolName || '未调用'}</p>
            </div>
            <div className="app-surface-muted rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Clock3 className="h-4 w-4 text-[#8fb5ff]" />
                时间窗口
              </div>
              <p className="text-sm leading-6 text-slate-300">{queryWindow}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="app-surface rounded-lg border p-3">
                <p className="text-xs font-semibold text-slate-400">结果估算</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">{result?.resultCount ?? 0}</p>
              </div>
              <div className="app-surface rounded-lg border p-3">
                <p className="text-xs font-semibold text-slate-400">耗时</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">{result ? `${result.durationMs}ms` : '-'}</p>
              </div>
            </div>
          </div>

          <section className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-50">原始结果摘要</h3>
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-5 text-slate-100">
              {result?.rawResult || '暂无结果'}
            </pre>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default LogsAnalysisPage;
