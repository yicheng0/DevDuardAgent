import AppLayout from '@/components/layout/AppLayout';
import SettingsPage from '@/components/config/SettingsPage';
import OpsWorkbench from '@/components/ops/OpsWorkbench';
import ChatContainer from '@/components/chat/ChatContainer';
import { useChatStore } from '@/stores/chatStore';
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
  { label: 'API 基址', value: 'localhost:6872' },
  { label: '响应模式', value: '流式 / 快速' },
  { label: '知识文件', value: 'TXT / MD' },
];

const OverviewPage = () => (
  <div className="h-full min-h-0 overflow-y-auto bg-slate-50 p-3 xl:overflow-hidden">
    <div className="grid h-full min-h-[760px] gap-3 xl:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#ead1c5] bg-[#fbf7f4] px-2.5 py-1 text-xs font-semibold text-[#7f432f]">
                <Activity className="h-3.5 w-3.5" />
                DevGuard Agent
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                AI 运维响应工作台
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                这个项目把智能对话、知识库检索、告警分析和 Agent Trace 放在同一个运维控制台里，用于辅助定位故障、整理证据并生成处置建议。
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white sm:flex">
              <Zap className="h-6 w-6 text-[#d9a08a]" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {projectHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f7ebe5] text-[#7f432f]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-950">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-950">当前接入状态</h2>
            <div className="mt-3 grid gap-2">
              {runtimeStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                  <span className="truncate text-sm font-semibold text-slate-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:min-h-0">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <MessageSquareText className="h-4 w-4 text-[#9a563f]" />
              Agent 对话
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              在总览页直接提问、上传资料或让 Agent 分析运维问题
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
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
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50 p-4">
      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <div className="max-w-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#ead1c5] bg-[#fbf7f4] text-[#7f432f]">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {view.status}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {view.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{view.description}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            <BarChart3 className="h-4 w-4 text-[#9a563f]" />
            告警队列仅在“告警处置”模块显示
          </div>
        </div>
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
