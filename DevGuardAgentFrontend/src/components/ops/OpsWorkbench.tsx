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
  GitBranch,
  ListChecks,
  MessageSquareText,
  Radio,
  PlayCircle,
  Server,
  ShieldCheck,
  Target,
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

interface IncidentContext {
  hypothesis: string;
  assessment: string;
  nextAction: string;
  evidence: EvidenceItem[];
  remediation: RemediationStep[];
}

const incidentContexts: Record<string, IncidentContext> = {
  'inc-2471': {
    hypothesis: '14:05 发布批次扩大了数据库写入路径的连接占用，checkout-api 在支付确认链路触发连接池耗尽。',
    assessment: '用户下单确认已受影响，应先降低错误率并保留发布窗口证据，再决定回滚或扩容。',
    nextAction: '运行 Agent 汇总 Prometheus、Loki 和 trace 证据，优先执行低风险连接池止血方案。',
    evidence: evidenceItems,
    remediation: remediationSteps,
  },
  'inc-2468': {
    hypothesis: 'order-worker 消费者重启后并发未恢复，重试任务放大队列积压，导致异步通知持续延迟。',
    assessment: '业务链路未完全中断，但积压继续扩大时会影响发货通知和补偿任务时效。',
    nextAction: '先确认消费者实例数、死信比例和重试策略，再分批扩容消费者并暂停高频重试。',
    evidence: [
      {
        id: 'ev-worker-1',
        type: 'metric',
        source: 'Prometheus / order-worker',
        content: 'queue depth 保持在 46k 附近，consumer lag 持续超过 18 分钟。',
        confidence: 90,
      },
      {
        id: 'ev-worker-2',
        type: 'log',
        source: 'Loki / worker logs',
        content: '同一批订单任务重复进入 retry，部分消费者启动后未成功注册分片。',
        confidence: 83,
      },
      {
        id: 'ev-worker-3',
        type: 'doc',
        source: 'Runbook / queue backlog',
        content: '历史手册建议先冻结重试风暴，再按分片扩容消费者避免重复消费。',
        confidence: 78,
      },
    ],
    remediation: [
      {
        id: 'step-worker-1',
        title: '临时扩容 order-worker 消费者副本',
        status: 'ready',
        risk: 'medium',
        requiresApproval: true,
        command: 'kubectl scale deploy/order-worker --replicas=12',
      },
      {
        id: 'step-worker-2',
        title: '暂停高频失败任务的自动重试',
        status: 'ready',
        risk: 'medium',
        requiresApproval: true,
        command: 'queuectl retry pause --topic order-events --reason backlog',
      },
      {
        id: 'step-worker-3',
        title: '导出积压峰值和消费者恢复时间用于复盘',
        status: 'ready',
        risk: 'low',
      },
    ],
  },
  'inc-2461': {
    hypothesis: '登录失败请求集中来自单一 ASN，疑似撞库或自动化探测，当前还未形成明确用户影响。',
    assessment: '需要先区分误报、压测流量和攻击流量，避免直接封禁影响正常企业出口。',
    nextAction: '拉取 WAF、登录失败样本和 ASN 维度分布，确认后再收紧策略或加入临时挑战。',
    evidence: [
      {
        id: 'ev-auth-1',
        type: 'metric',
        source: 'Prometheus / auth-gateway',
        content: '401 比例较基线增加 31%，成功登录率没有同步下跌。',
        confidence: 86,
      },
      {
        id: 'ev-auth-2',
        type: 'log',
        source: 'Loki / auth logs',
        content: '失败请求集中在相近 UA 和 ASN，用户名枚举模式明显但来源 IP 分散。',
        confidence: 82,
      },
      {
        id: 'ev-auth-3',
        type: 'trace',
        source: 'WAF audit trail',
        content: 'WAF 命中率偏低，现有规则未覆盖该类低频分散登录失败。',
        confidence: 74,
      },
    ],
    remediation: [
      {
        id: 'step-auth-1',
        title: '对异常 ASN 启用登录挑战策略',
        status: 'ready',
        risk: 'medium',
        requiresApproval: true,
        command: 'wafctl challenge enable --asn suspicious --path /login',
      },
      {
        id: 'step-auth-2',
        title: '拉取失败登录样本并比对账号命中分布',
        status: 'ready',
        risk: 'low',
      },
      {
        id: 'step-auth-3',
        title: '直接封禁整个 ASN',
        status: 'blocked',
        risk: 'high',
        requiresApproval: true,
      },
    ],
  },
  'inc-2457': {
    hypothesis: '日志索引节点在峰值写入期间 CPU 升高，采集延迟随扩容后恢复。',
    assessment: '当前服务已恢复，重点转为验证索引容量水位和补充复盘材料。',
    nextAction: '归档恢复时间线，补充容量阈值和下次扩容触发条件。',
    evidence: [
      {
        id: 'ev-log-1',
        type: 'metric',
        source: 'Prometheus / log-pipeline',
        content: 'ingest lag 峰值约 7 分钟，扩容后回落到 1 分钟以内。',
        confidence: 88,
      },
      {
        id: 'ev-log-2',
        type: 'log',
        source: 'Indexer logs',
        content: '索引节点在峰值期间出现写入排队，未发现数据丢弃记录。',
        confidence: 81,
      },
      {
        id: 'ev-log-3',
        type: 'doc',
        source: 'Postmortem draft',
        content: '上次复盘建议将 index CPU 75% 作为提前扩容观察阈值。',
        confidence: 76,
      },
    ],
    remediation: [
      {
        id: 'step-log-1',
        title: '确认日志采集延迟已持续回落',
        status: 'done',
        risk: 'low',
      },
      {
        id: 'step-log-2',
        title: '补充 index CPU 容量预警阈值',
        status: 'ready',
        risk: 'low',
        command: 'alertctl set log-indexer-cpu --threshold 75',
      },
      {
        id: 'step-log-3',
        title: '生成日志采集延迟复盘摘要',
        status: 'ready',
        risk: 'low',
      },
    ],
  },
};

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
  open: 'bg-[#fff6e8] text-[#6f5b4b]',
  investigating: 'bg-[#f7ebe5] text-[#7f432f]',
  mitigating: 'bg-orange-100 text-orange-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const statusLaneOrder: IncidentItem['status'][] = [
  'open',
  'investigating',
  'mitigating',
  'resolved',
];

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

  const selectedContext = incidentContexts[selectedIncident.id] || incidentContexts[incidents[0].id];

  const incidentsByStatus = useMemo(
    () =>
      statusLaneOrder.map((status) => ({
        status,
        items: incidents.filter((incident) => incident.status === status),
      })),
    []
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
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[260px_minmax(520px,1fr)_320px] xl:gap-3 xl:overflow-hidden">
      <section className="app-surface mb-3 min-h-[260px] overflow-hidden rounded-lg border shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-[#ead7b7] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">生产事件看板</h2>
              <p className="mt-0.5 text-xs text-slate-500">按处置状态分组</p>
            </div>
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
              {incidents.filter((incident) => incident.status !== 'resolved').length} open
            </span>
          </div>
        </div>

        <div className="h-[calc(100%-61px)] space-y-3 overflow-y-auto p-3">
          {incidentsByStatus.map(({ status, items }) => (
            <section key={status} className="rounded-lg border border-[#ead7b7] bg-[#fffaf0] p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#2f2119]">{statusLabel[status]}</h3>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${statusStyle[status]}`}>
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.length ? (
                  items.map((incident) => (
                    <button
                      key={incident.id}
                      type="button"
                      onClick={() => {
                        setSelectedIncidentId(incident.id);
                        setActiveNav('alerts');
                      }}
                      className={`w-full cursor-pointer rounded-lg border p-2.5 text-left transition-colors hover:border-[#d9a08a] hover:bg-[#f7ebe5]/70 focus:outline-none focus:ring-2 focus:ring-[#9a563f]/30 ${
                        selectedIncident.id === incident.id
                          ? 'border-[#d9a08a] bg-[#f7ebe5]'
                          : 'border-[#ead7b7] bg-[#fffdf8]'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="min-w-0 text-sm font-semibold leading-5 text-slate-950">
                          {incident.title}
                        </span>
                        <span
                          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${severityStyle[incident.severity]}`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Server className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{incident.service}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {incident.updatedAt}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-[#ead7b7] bg-[#fffdf8] px-3 py-2 text-xs text-slate-400">
                    暂无事件
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <main className="agent-workbench mb-3 flex min-h-[620px] flex-col overflow-hidden rounded-lg border shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-[#ead7b7] bg-[#fff6e8] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyle[selectedIncident.status]}`}
                >
                  {statusLabel[selectedIncident.status]}
                </span>
                <RiskBadge level={selectedIncident.severity} />
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#d9a08a] bg-[#fffdf8] px-2 py-1 text-xs font-semibold text-[#7f432f]">
                  {isRunning ? (
                    <PlayCircle className="h-3.5 w-3.5 text-[#9a563f]" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  Agent {agentStatus}
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#2f2119]">
                {selectedIncident.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f5b4b]">
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

        <div className="grid gap-3 border-b border-[#ead7b7] bg-[#fffaf0] p-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#ead7b7] bg-[#fffdf8] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#6f5b4b]">
              <Server className="h-4 w-4 text-[#9a563f]" />
              受影响服务
            </div>
            <p className="truncate text-lg font-semibold text-[#2f2119]">{selectedIncident.service}</p>
            <p className="mt-1 truncate text-xs text-[#8a7562]">{selectedIncident.owner}</p>
          </div>
          <div className="rounded-lg border border-[#ead7b7] bg-[#fffdf8] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#6f5b4b]">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              影响范围
            </div>
            <p className="truncate text-lg font-semibold text-[#2f2119]">{selectedIncident.affectedUsers}</p>
            <p className="mt-1 text-xs text-[#8a7562]">指标与日志估算</p>
          </div>
          <div className="rounded-lg border border-[#ead7b7] bg-[#fffdf8] p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#6f5b4b]">
              <Clock3 className="h-4 w-4 text-[#9a563f]" />
              最近更新
            </div>
            <p className="truncate text-lg font-semibold text-[#2f2119]">{selectedIncident.updatedAt}</p>
            <p className="mt-1 text-xs text-[#8a7562]">持续自动刷新</p>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#ead7b7] bg-[#fffdf8] p-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)]">
          <div className="rounded-lg border border-[#ead7b7] bg-[#fffaf0] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2f2119]">
              <GitBranch className="h-4 w-4 text-[#9a563f]" />
              根因假设
            </div>
            <p className="text-sm leading-6 text-[#5f4a3a]">{selectedContext.hypothesis}</p>
            <div className="mt-3 rounded-md bg-[#fffdf8] px-3 py-2 text-sm leading-6 text-[#6f5b4b] ring-1 ring-[#ead7b7]">
              {selectedContext.assessment}
            </div>
          </div>

          <div className="rounded-lg border border-[#ead7b7] bg-[#fffaf0] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2f2119]">
              <Target className="h-4 w-4 text-[#9a563f]" />
              下一步
            </div>
            <p className="text-sm leading-6 text-[#5f4a3a]">{selectedContext.nextAction}</p>
          </div>
        </div>

        <div className="border-b border-[#ead7b7] bg-[#fffaf0] px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#6f5b4b]">
            <ListChecks className="h-4 w-4 text-[#9a563f]" />
            核心信号
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIncident.signals.map((signal) => (
              <span
                key={signal}
                className="rounded-md border border-[#ead7b7] bg-[#fffdf8] px-2.5 py-1.5 text-xs font-semibold text-[#5f4a3a]"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#2f2119]">
                <MessageSquareText className="h-4 w-4 text-[#9a563f]" />
                Agent 推理轨迹
              </h2>
              <p className="mt-1 text-xs text-[#8a7562]">
                展示任务理解、证据检索、运行态查询、风险研判和响应生成过程
              </p>
            </div>
          </div>

          {result?.steps ? (
            <TraceTimeline steps={result.steps} />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[#d9a08a] bg-[#fff6e8] p-8 text-center">
              <div className="max-w-md">
                <Bot className="mx-auto h-10 w-10 text-[#9a563f]" />
                <p className="mt-4 text-base font-semibold text-[#2f2119]">选择告警并运行 Agent</p>
                <p className="mt-2 text-sm leading-6 text-[#6f5b4b]">
                  中间主舞台会同步展示推理链路，便于比赛演示时说明 Agent 如何调用工具、归因和生成处置建议。
                </p>
              </div>
            </div>
          )}

          {result?.finalReport && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <Database className="h-4 w-4" />
                最终处置摘要
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {result.finalReport}
              </p>
            </div>
          )}
        </div>
      </main>

      <aside className="app-surface flex min-h-[640px] flex-col overflow-hidden rounded-lg border shadow-sm xl:min-h-0">
        <div className="border-b border-[#ead7b7] px-4 py-3">
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
              {selectedContext.evidence.map((item) => {
                const Icon = evidenceIcon[item.type];
                return (
                  <article
                    key={item.id}
                    className="app-surface rounded-lg border p-3 shadow-sm"
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
                      <span className="shrink-0 rounded-md bg-[#fff6e8] px-2 py-1 text-xs font-medium text-[#6f5b4b]">
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
              {selectedContext.remediation.map((step, index) => (
                <article key={step.id} className="app-surface-muted rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fffdf8] text-xs font-semibold text-slate-700 ring-1 ring-[#ead7b7]">
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
                        <span className="rounded-md bg-[#fffdf8] px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-[#ead7b7]">
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

        <div className="flex h-[460px] min-h-[420px] shrink-0 flex-col border-t border-[#ead7b7] bg-[#fffdf8] xl:h-[46vh] xl:max-h-[560px]">
          <div className="flex items-center justify-between gap-3 border-b border-[#ead7b7] px-4 py-2.5">
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
