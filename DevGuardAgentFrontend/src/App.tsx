import AppLayout from '@/components/layout/AppLayout';
import SettingsPage from '@/components/config/SettingsPage';
import OpsWorkbench from '@/components/ops/OpsWorkbench';
import ChatContainer from '@/components/chat/ChatContainer';
import LogsAnalysisPage from '@/components/logs/LogsAnalysisPage';
import KnowledgePage from '@/components/knowledge/KnowledgePage';
import MetricsHealthPage from '@/components/metrics/MetricsHealthPage';
import HistoryPage from '@/components/history/HistoryPage';
import { TraceTimeline } from '@/components/aiops/TraceTimeline';
import { useChatStore } from '@/stores/chatStore';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { useUIStore } from '@/stores/uiStore';
import { NavItemId } from '@/types';
import {
  Activity,
  BarChart3,
  BookOpen,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  Route,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';

const moduleViews: Record<
  Exclude<NavItemId, 'alerts' | 'settings'>,
  {
    title: string;
    description: string;
    icon: typeof LayoutDashboard;
    status: string;
  }
> = {
  overview: {
    title: '运维总览',
    description: '服务态势、风险趋势和 Agent 运行概览会在这里集中展示。',
    icon: LayoutDashboard,
    status: '总览模块待接入真实指标',
  },
  logs: {
    title: '日志分析',
    description: '用于检索异常日志、聚合错误模式和辅助定位故障上下文。',
    icon: FileText,
    status: '日志检索视图待接入',
  },
  metrics: {
    title: '指标健康',
    description: '展示 SLO、关键服务指标和近期容量趋势。',
    icon: Gauge,
    status: '指标看板待接入',
  },
  knowledge: {
    title: '知识库',
    description: '管理运维手册、复盘经验和 Agent 可检索的内部知识。',
    icon: BookOpen,
    status: '知识库管理视图待接入',
  },
  trace: {
    title: 'Agent Trace',
    description: '查看 Agent 的任务理解、工具调用、证据检索和响应生成链路。',
    icon: Route,
    status: 'Trace 详情视图待接入',
  },
  history: {
    title: '任务历史',
    description: '回看历史对话、告警处置任务和生成过的分析报告。',
    icon: Clock3,
    status: '历史记录视图待接入',
  },
};

const projectHighlights = [
  {
    title: '智能问答',
    description: '面向运维场景的 Agent 对话入口，支持流式响应和文件上下文。',
    icon: MessageSquareText,
  },
  {
    title: '告警处置',
    description: '把告警、日志、指标和知识库串成可追踪的分析链路。',
    icon: ShieldCheck,
  },
  {
    title: '知识增强',
    description: '上传手册或复盘材料后，可作为内部知识参与检索与回答。',
    icon: BookOpen,
  },
];

const runtimeStats = [
  { label: 'API 基址', value: 'localhost:8000' },
  { label: '响应模式', value: '流式 / 快速' },
  { label: '知识文件', value: 'TXT / MD' },
];

const OverviewPage = () => (
  <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:overflow-hidden">
    <div className="grid h-full min-h-[760px] gap-3 xl:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
      <section className="app-surface flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 shadow-[0_16px_38px_rgba(3,8,20,0.24)]">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
                <Activity className="h-3.5 w-3.5" />
                Flash API
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                AI 运维响应工作台
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                这个项目把智能对话、知识库检索、告警分析和 Agent Trace 放在同一个运维控制台里，用于辅助定位故障、整理证据并生成处置建议。
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-100 sm:flex">
              <Zap className="h-6 w-6 text-[#8fb5ff]" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {projectHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="app-surface-muted rounded-lg border border-white/10 p-4 shadow-[0_10px_28px_rgba(3,8,20,0.18)]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0f1f38] text-[#8fb5ff]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-50">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="app-surface-muted mt-5 rounded-lg border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-slate-50">当前接入状态</h2>
            <div className="mt-3 grid gap-2">
              {runtimeStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0f1f38] px-3 py-2">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <span className="truncate text-sm font-semibold text-slate-100">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="app-surface flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-white/10 shadow-[0_16px_38px_rgba(3,8,20,0.24)] xl:min-h-0">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-50">
              <MessageSquareText className="h-4 w-4 text-[#8fb5ff]" />
              Agent 对话
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              在总览页直接提问、上传资料或让 Agent 分析运维问题
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-2 py-1 text-xs font-semibold text-[#c3d7ff]">
            <Activity className="h-3.5 w-3.5" />
            online
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <ChatContainer />
        </div>
      </section>
    </div>
  </div>
);

const ModulePlaceholder = ({ activeNav }: { activeNav: Exclude<NavItemId, 'alerts' | 'settings'> }) => {
  const view = moduleViews[activeNav];
  const Icon = view.icon;

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-4">
      <section className="app-surface flex min-h-[calc(100vh-7rem)] items-center justify-center rounded-lg border border-dashed border-white/10 px-6 py-12 text-center shadow-[0_16px_36px_rgba(3,8,20,0.18)]">
        <div className="max-w-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#0f1f38] text-[#8fb5ff]">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {view.status}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            {view.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{view.description}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0f1f38] px-3 py-2 text-sm font-medium text-slate-300">
            <BarChart3 className="h-4 w-4 text-[#8fb5ff]" />
            告警队列仅在“告警处置”模块显示
          </div>
        </div>
      </section>
    </div>
  );
};

const AgentTracePage = () => {
  const { result, isRunning } = useAIOpsStore();
  const steps = result?.steps || [];
  const completed = steps.filter((step) => step.status === 'completed').length;
  const tools = steps.filter((step) => step.toolName).length;

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-4">
      <section className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="app-surface rounded-lg border border-white/10 p-5 shadow-[0_16px_36px_rgba(3,8,20,0.2)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0f1f38] px-2.5 py-1 text-xs font-semibold text-slate-200">
                <Route className="h-3.5 w-3.5" />
                Agent Trace
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                推理链路
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                查看当前会话最近一次 Agent 任务的阶段、工具调用、证据摘要和执行状态。
              </p>
            </div>
            <div className="grid min-w-[260px] grid-cols-3 gap-2">
              <div className="app-surface-muted rounded-lg border border-white/10 p-3">
                <p className="text-lg font-semibold text-slate-50">{completed}/{steps.length}</p>
                <p className="text-xs text-slate-400">完成阶段</p>
              </div>
              <div className="app-surface-muted rounded-lg border border-white/10 p-3">
                <p className="text-lg font-semibold text-slate-50">{tools}</p>
                <p className="text-xs text-slate-400">工具调用</p>
              </div>
              <div className="app-surface-muted rounded-lg border border-white/10 p-3">
                <p className="text-lg font-semibold text-slate-50">
                  {isRunning ? '运行中' : steps.length ? '已归档' : '等待中'}
                </p>
                <p className="text-xs text-slate-400">状态</p>
              </div>
            </div>
          </div>
        </div>

        <div className="agent-workbench rounded-lg border border-white/10 p-4 shadow-[0_16px_36px_rgba(3,8,20,0.18)]">
          {steps.length ? (
            <TraceTimeline steps={steps} />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#0f1f38] text-[#8fb5ff]">
                  <Route className="h-6 w-6" />
                </div>
                <p className="text-base font-medium text-slate-50">暂无 Trace</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  发送一条流式 Agent 请求后，这里会展示后端真实 callback 事件生成的链路。
                </p>
              </div>
            </div>
          )}
        </div>

        {result?.finalReport && (
          <div className="rounded-lg border border-[#4f8cff]/20 bg-[#4f8cff]/10 p-4">
            <h2 className="text-sm font-semibold text-[#c3d7ff]">最终处置摘要</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {result.finalReport}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

const renderActiveView = (activeNav: NavItemId) => {
  if (activeNav === 'settings') {
    return <SettingsPage />;
  }

  if (activeNav === 'alerts') {
    return <OpsWorkbench />;
  }

  if (activeNav === 'overview') {
    return <OverviewPage />;
  }

  if (activeNav === 'logs') {
    return <LogsAnalysisPage />;
  }

  if (activeNav === 'metrics') {
    return <MetricsHealthPage />;
  }

  if (activeNav === 'knowledge') {
    return <KnowledgePage />;
  }

  if (activeNav === 'trace') {
    return <AgentTracePage />;
  }

  if (activeNav === 'history') {
    return <HistoryPage />;
  }

  return <ModulePlaceholder activeNav={activeNav} />;
};

function App() {
  const { getCurrentSession, createSession } = useChatStore();
  const { activeNav } = useUIStore();
  const session = getCurrentSession();

  useEffect(() => {
    // Create initial session if none exists
    if (!session) {
      createSession();
    }
  }, []);

  return (
    <AppLayout>{renderActiveView(activeNav)}</AppLayout>
  );
}

export default App;
