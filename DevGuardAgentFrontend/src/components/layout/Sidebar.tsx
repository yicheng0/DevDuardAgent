import {
  Activity,
  AlertTriangle,
  BookOpen,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  Route,
  Settings,
} from 'lucide-react';
import { NavItemId } from '@/types';
import { useUIStore } from '@/stores/uiStore';

const navItems: Array<{
  id: NavItemId;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: '总览', description: '服务态势', icon: LayoutDashboard },
  { id: 'alerts', label: '告警处置', description: '事件队列', icon: AlertTriangle },
  { id: 'logs', label: '日志分析', description: '异常模式', icon: FileText },
  { id: 'metrics', label: '指标健康', description: 'SLO 与趋势', icon: Gauge },
  { id: 'knowledge', label: '知识库', description: '手册与经验', icon: BookOpen },
  { id: 'trace', label: 'Agent Trace', description: '推理链路', icon: Route },
  { id: 'history', label: '任务历史', description: '对话记录', icon: Clock3 },
  { id: 'settings', label: '设置', description: '系统配置', icon: Settings },
];

const BrandMark = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(35,76,164,0.55),rgba(124,92,255,0.24))] shadow-[0_12px_28px_rgba(3,8,20,0.32)] ${
      collapsed ? 'h-11 w-11' : 'h-10 w-10'
    }`}
    title="DevGuard Agent"
    aria-label="DevGuard Agent"
  >
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      className={collapsed ? 'h-8 w-8' : 'h-7 w-7'}
    >
      <rect x="5" y="5" width="38" height="38" rx="11" fill="#07111f" />
      <rect x="5.75" y="5.75" width="36.5" height="36.5" rx="10.25" fill="none" stroke="rgba(167,191,255,0.34)" strokeWidth="1.5" />
      <path
        d="M16 14.5h6.5c6.1 0 10 3.65 10 9.5s-3.9 9.5-10 9.5H16v-19Z"
        fill="none"
        stroke="#e5eefc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M31.5 22.5h5.5v10.25c-2.55 1.25-5.12 1.85-7.7 1.85-5.65 0-9.8-4.1-9.8-9.75 0-5.8 4.3-9.85 10.2-9.85 2.95 0 5.35.9 7.35 2.55"
        fill="none"
        stroke="#8a6cff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
      <path d="M16 36h20" stroke="#6aa6ff" strokeLinecap="round" strokeWidth="2" />
    </svg>
  </div>
);

const Sidebar = () => {
  const { activeNav, isSidebarCollapsed, setActiveNav } = useUIStore();

  return (
    <aside
      className={`app-surface flex h-full flex-col overflow-hidden border-r border-white/10 shadow-[0_16px_38px_rgba(3,8,20,0.28)] transition-[width] duration-200 ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
      aria-label="主导航"
    >
      <div className={`border-b border-white/10 py-4 ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <BrandMark collapsed={isSidebarCollapsed} />
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-100">
                DevGuard Agent
              </h1>
              <p className="text-xs font-medium text-slate-400">Flash API Console</p>
            </div>
          )}
        </div>
      </div>

      <nav className={`min-h-0 flex-1 space-y-1 overflow-y-auto ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={`sidebar-nav-item group brand-focus-ring relative flex w-full cursor-pointer items-center overflow-hidden rounded-lg border transition-all duration-200 ${
                isSidebarCollapsed ? 'h-11 justify-center px-0 py-0' : 'min-h-11 gap-3 px-3 py-2.5 pl-4 text-left'
              } ${
                isActive
                  ? 'sidebar-nav-active text-slate-100'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <span
                className={`absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full transition-all duration-200 ${
                  isActive ? 'bg-[#4f8cff] opacity-100 shadow-[0_0_12px_rgba(79,140,255,0.55)]' : 'opacity-0'
                }`}
              />
              <span
                className={`flex shrink-0 items-center justify-center rounded-md transition-all duration-200 ${
                  isSidebarCollapsed ? 'h-9 w-9' : 'h-6 w-6'
                } ${
                  isActive
                    ? 'bg-white/10 text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'bg-[#0f1f38] text-slate-400 group-hover:bg-white/10 group-hover:text-slate-100'
                }`}
              >
                <Icon className={isSidebarCollapsed ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]'} />
              </span>
              {!isSidebarCollapsed && (
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm ${
                      isActive
                        ? 'font-semibold text-slate-50'
                        : 'font-medium text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      isActive ? 'text-[#9cbcff]' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.description}
                  </span>
                </span>
              )}
              {!isSidebarCollapsed && isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4f8cff] shadow-[0_0_10px_rgba(79,140,255,0.65)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
        {isSidebarCollapsed ? (
          <div
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[#4f8cff]/20 bg-[#4f8cff]/10 text-[#8fb5ff]"
            title="Runtime healthy"
          >
            <Activity className="h-4 w-4" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[#4f8cff]/20 bg-[#4f8cff]/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#c3d7ff]">
                <Activity className="h-4 w-4" />
                Runtime healthy
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#c3d7ff]/80">
                <span>5 tools ready</span>
                <span>stream on</span>
              </div>
            </div>
            <div className="mt-3 px-1 text-xs text-slate-400">v1.0 · flash api workspace</div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
