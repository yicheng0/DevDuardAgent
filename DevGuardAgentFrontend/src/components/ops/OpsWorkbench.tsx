import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Gauge,
  MessageSquareText,
  Radio,
  PlayCircle,
  Server,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { EvidenceItem, IncidentItem, RemediationStep } from '@/types';
import ChatContainer from '@/components/chat/ChatContainer';
import { TraceTimeline } from '@/components/aiops/TraceTimeline';
import { RiskBadge } from '@/components/aiops/RiskBadge';

const incidents: IncidentItem[] = [
  {
    id: 'inc-2471',
    title: 'checkout-api 错误率突增',
    service: 'checkout-api',
    severity: 'critical',
    status: 'investigating',
    updatedAt: '2 分钟前',
    summary: '5xx 错误率从 0.4% 升至 11.8%，影响支付链路下单确认。',
    owner: 'SRE / Payments',
    affectedUsers: '约 18.2k 请求',
    signals: ['HTTP 5xx +11.4%', 'p95 延迟 3.8s', 'DB 连接池耗尽'],
  },
  {
    id: 'inc-2468',
    title: 'worker 队列积压超过阈值',
    service: 'order-worker',
    severity: 'high',
    status: 'mitigating',
    updatedAt: '11 分钟前',
    summary: '订单异步任务积压 46k，消费者重启后吞吐未恢复。',
    owner: 'Platform Ops',
    affectedUsers: '延迟发货通知',
    signals: ['Queue depth 46k', 'consumer lag 18m', 'retry rate 23%'],
  },
  {
    id: 'inc-2461',
    title: '登录服务异常请求增加',
    service: 'auth-gateway',
    severity: 'medium',
    status: 'open',
    updatedAt: '28 分钟前',
    summary: '来自单一 ASN 的失败登录请求增加，需要判断误报或撞库风险。',
    owner: 'Security Ops',
    affectedUsers: '无明确用户影响',
    signals: ['401 +31%', '单 ASN 集中', 'WAF 未拦截'],
  },
  {
    id: 'inc-2457',
    title: '日志采集延迟',
    service: 'log-pipeline',
    severity: 'low',
    status: 'resolved',
    updatedAt: '1 小时前',
    summary: '采集延迟已恢复，保留用于复盘索引扩容策略。',
    owner: 'Observability',
    affectedUsers: '内部查询延迟',
    signals: ['ingest lag 7m', 'index CPU 83%', '已恢复'],
  },
];

const evidenceItems: EvidenceItem[] = [
  {
    id: 'ev-1',
    type: 'metric',
    source: 'Prometheus / checkout-api',
    content: 'checkout-api 5xx rate 在 14:07 后持续高于 10%，与发布窗口重合。',
    confidence: 92,
  },
  {
    id: 'ev-2',
    type: 'log',
    source: 'Loki / payment logs',
    content: '大量 timeout waiting for connection from pool，集中在 payment_repository.go。',
    confidence: 88,
  },
  {
    id: 'ev-3',
    type: 'trace',
    source: 'OpenTelemetry trace',
    content: '慢调用集中在 /v1/checkout/confirm -> mysql write span。',
    confidence: 84,
  },
];

const remediationSteps: RemediationStep[] = [
  {
    id: 'step-1',
    title: '临时扩大 checkout-api DB 连接池上限',
    status: 'ready',
    risk: 'medium',
    requiresApproval: true,
    command: 'kubectl set env deploy/checkout-api DB_POOL_MAX=80',
  },
  {
    id: 'step-2',
    title: '回滚 14:05 发布批次',
    status: 'blocked',
    risk: 'high',
    requiresApproval: true,
    command: 'deployctl rollback checkout-api --to previous',
  },
  {
    id: 'step-3',
    title: '补充告警事件复盘摘要',
    status: 'ready',
    risk: 'low',
  },
];

const severityStyle = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-sky-200 bg-sky-50 text-sky-700',
  high: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
};

const statusLabel = {
  open: '待处理',
  investigating: '研判中',
  mitigating: '止血中',
  resolved: '已恢复',
};

const statusStyle = {
  open: 'bg-slate-100 text-slate-700',
  investigating: 'bg-[#f7ebe5] text-[#7f432f]',
  mitigating: 'bg-orange-100 text-orange-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const stepStatusStyle = {
  ready: 'bg-[#f7ebe5] text-[#7f432f]',
  running: 'bg-orange-50 text-orange-700',
  blocked: 'bg-red-50 text-red-700',
  done: 'bg-emerald-50 text-emerald-700',
};

const evidenceIcon = {
  metric: Gauge,
  log: TerminalSquare,
  trace: ArrowUpRight,
  doc: FileSearch,
};

const OpsWorkbench = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0].id);
  const { result, isRunning, startDemoTrace } = useAIOpsStore();
  const { addMessage, currentSessionId, createSession } = useChatStore();
  const { setActiveNav } = useUIStore();

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedIncidentId) || incidents[0],
    [selectedIncidentId]
  );

  const handleRunAgent = () => {
    const prompt = `分析告警：${selectedIncident.title}`;
    if (!currentSessionId) {
      createSession();
    }
    addMessage({ role: 'user', content: prompt });
    startDemoTrace(prompt);
    setActiveNav('trace');
  };

  const agentStatus = isRunning ? '运行中' : result?.finalReport ? '已完成' : '待命';

  return (
    <div className="h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[260px_minmax(520px,1fr)_320px] xl:gap-3 xl:overflow-hidden">
      <section className="mb-3 min-h-[260px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">生产事件队列</h2>
              <p className="mt-0.5 text-xs text-slate-500">按影响面排序</p>
            </div>
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
              {incidents.filter((incident) => incident.status !== 'resolved').length} open
            </span>
          </div>
        </div>

        <div className="h-[calc(100%-61px)] space-y-2 overflow-y-auto p-3">
          {incidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => {
                setSelectedIncidentId(incident.id);
                setActiveNav('alerts');
              }}
              className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:border-[#d9a08a] hover:bg-[#f7ebe5]/70 focus:outline-none focus:ring-2 focus:ring-[#9a563f]/30 ${
                selectedIncident.id === incident.id
                  ? 'border-[#d9a08a] bg-[#f7ebe5]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-5 text-slate-950">
                  {incident.title}
                </span>
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${severityStyle[incident.severity]}`}
                >
                  {incident.severity}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5" />
                  {incident.service}
                </span>
                <span className={`rounded px-1.5 py-0.5 ${statusStyle[incident.status]}`}>
                  {statusLabel[incident.status]}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                {incident.updatedAt}
              </div>
            </button>
          ))}
        </div>
      </section>

      <main className="mb-3 flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-slate-800 bg-slate-900 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyle[selectedIncident.status]}`}
                >
                  {statusLabel[selectedIncident.status]}
                </span>
                <RiskBadge level={selectedIncident.severity} />
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-300">
                  {isRunning ? (
                    <PlayCircle className="h-3.5 w-3.5 text-[#d9a08a]" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  )}
                  Agent {agentStatus}
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                {selectedIncident.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                {selectedIncident.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunAgent}
              disabled={isRunning}
              className="brand-button brand-button-lg shrink-0"
            >
              <Bot className="h-4 w-4" />
              {isRunning ? '分析中' : result?.steps ? '重新分析' : '运行 Agent'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-800 bg-slate-950/75 p-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Server className="h-4 w-4 text-[#d9a08a]" />
              受影响服务
            </div>
            <p className="truncate text-lg font-semibold text-white">{selectedIncident.service}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{selectedIncident.owner}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <AlertTriangle className="h-4 w-4 text-orange-300" />
              影响范围
            </div>
            <p className="truncate text-lg font-semibold text-white">{selectedIncident.affectedUsers}</p>
            <p className="mt-1 text-xs text-slate-500">指标与日志估算</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock3 className="h-4 w-4 text-slate-300" />
              最近更新
            </div>
            <p className="truncate text-lg font-semibold text-white">{selectedIncident.updatedAt}</p>
            <p className="mt-1 text-xs text-slate-500">持续自动刷新</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquareText className="h-4 w-4 text-[#d9a08a]" />
                Agent 推理轨迹
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                展示任务理解、证据检索、运行态查询、风险研判和响应生成过程
              </p>
            </div>
          </div>

          {result?.steps ? (
            <TraceTimeline steps={result.steps} />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
              <div className="max-w-md">
                <Bot className="mx-auto h-10 w-10 text-[#d9a08a]" />
                <p className="mt-4 text-base font-semibold text-white">选择告警并运行 Agent</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  中间主舞台会同步展示推理链路，便于比赛演示时说明 Agent 如何调用工具、归因和生成处置建议。
                </p>
              </div>
            </div>
          )}

          {result?.finalReport && (
            <div className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <Database className="h-4 w-4" />
                最终处置摘要
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-emerald-50">
                {result.finalReport}
              </p>
            </div>
          )}
        </div>
      </main>

      <aside className="flex min-h-[640px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:min-h-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">处置上下文</h2>
              <p className="mt-0.5 text-xs text-slate-500">证据、步骤与人工确认</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              护栏开启
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">关键证据</h3>
              <button
                type="button"
                className="brand-text-link cursor-pointer rounded px-1 text-xs font-semibold"
              >
                查看全部
              </button>
            </div>
            <div className="space-y-3">
              {evidenceItems.map((item) => {
                const Icon = evidenceIcon[item.type];
                return (
                  <article
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f7ebe5] text-[#7f432f]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {item.source}
                          </p>
                          <p className="text-xs uppercase text-slate-500">{item.type}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.confidence}%
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item.content}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-950">推荐处置步骤</h3>
            <div className="space-y-3">
              {remediationSteps.map((step, index) => (
                <article key={step.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold leading-5 text-slate-950">
                          {step.title}
                        </p>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${stepStatusStyle[step.status]}`}
                        >
                          {step.status}
                        </span>
                        <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          {step.risk} risk
                        </span>
                      </div>
                      {step.command && (
                        <code className="mt-3 block overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-100">
                          {step.command}
                        </code>
                      )}
                      {step.requiresApproval && (
                        <p className="mt-2 text-xs text-orange-700">需要人工确认后执行</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="flex h-[460px] min-h-[420px] shrink-0 flex-col border-t border-slate-200 bg-white xl:h-[46vh] xl:max-h-[560px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <MessageSquareText className="h-4 w-4 text-[#9a563f]" />
                向 Agent 追问
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">补充上下文、追问证据或生成处置话术</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#f7ebe5] px-2 py-1 text-xs font-semibold text-[#7f432f]">
              <Radio className="h-3.5 w-3.5" />
              {isRunning ? '同步中' : '可用'}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ChatContainer compact />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default OpsWorkbench;
