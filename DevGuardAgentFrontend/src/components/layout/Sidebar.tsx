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
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ead1c5] bg-[#fbf7f4] shadow-[0_10px_24px_rgba(127,67,47,0.12)] ${
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
      <rect x="5" y="5" width="38" height="38" rx="11" fill="#fffaf7" />
      <rect x="5.75" y="5.75" width="36.5" height="36.5" rx="10.25" fill="none" stroke="#d8b7a8" strokeWidth="1.5" />
      <path
        d="M16 14.5h6.5c6.1 0 10 3.65 10 9.5s-3.9 9.5-10 9.5H16v-19Z"
        fill="none"
        stroke="#653221"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M31.5 22.5h5.5v10.25c-2.55 1.25-5.12 1.85-7.7 1.85-5.65 0-9.8-4.1-9.8-9.75 0-5.8 4.3-9.85 10.2-9.85 2.95 0 5.35.9 7.35 2.55"
        fill="none"
        stroke="#9a563f"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
      <path d="M16 36h20" stroke="#c6947d" strokeLinecap="round" strokeWidth="2" />
    </svg>
  </div>
);

const Sidebar = () => {
  const { activeNav, isSidebarCollapsed, setActiveNav } = useUIStore();

  return (
    <aside
      className={`app-surface flex h-full flex-col overflow-hidden border-r shadow-sm transition-[width] duration-200 ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
      aria-label="主导航"
    >
      <div className={`border-b border-[#ead7b7] py-4 ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <BrandMark collapsed={isSidebarCollapsed} />
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-950">
                DevGuard Agent
              </h1>
              <p className="text-xs font-medium text-slate-500">Ops Intelligence</p>
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
                  ? 'sidebar-nav-active text-[#7f432f]'
                  : 'text-[#5f4a3d] hover:text-slate-950'
              }`}
            >
              <span
                className={`absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full transition-all duration-200 ${
                  isActive ? 'bg-[#9a563f] opacity-100 shadow-[0_0_12px_rgba(154,86,63,0.55)]' : 'opacity-0'
                }`}
              />
              <span
                className={`flex shrink-0 items-center justify-center rounded-md transition-all duration-200 ${
                  isSidebarCollapsed ? 'h-9 w-9' : 'h-6 w-6'
                } ${
                  isActive
                    ? 'bg-[#fff6e8] text-[#7f432f] shadow-[inset_0_1px_0_rgba(255,248,232,0.85)]'
                    : 'bg-[#fffaf0] text-[#8a695a] group-hover:bg-[#fff6e8] group-hover:text-[#6f3b2a]'
                }`}
              >
                <Icon className={isSidebarCollapsed ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]'} />
              </span>
              {!isSidebarCollapsed && (
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm ${
                      isActive
                        ? 'font-semibold text-[#653221]'
                        : 'font-medium text-[#4f3f35] group-hover:text-[#241a15]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      isActive ? 'text-[#9a563f]/75' : 'text-[#806a5c] group-hover:text-[#6f5b4b]'
                    }`}
                  >
                    {item.description}
                  </span>
                </span>
              )}
              {!isSidebarCollapsed && isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a563f] shadow-[0_0_10px_rgba(154,86,63,0.65)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-[#ead7b7] ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
        {isSidebarCollapsed ? (
          <div
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700"
            title="Runtime healthy"
          >
            <Activity className="h-4 w-4" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Activity className="h-4 w-4" />
                Runtime healthy
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
                <span>5 tools ready</span>
                <span>stream on</span>
              </div>
            </div>
            <div className="mt-3 px-1 text-xs text-slate-400">v1.0 · production workspace</div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
