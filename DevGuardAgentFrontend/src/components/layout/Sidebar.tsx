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
  Shield,
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

const Sidebar = () => {
  const { activeNav, setActiveNav } = useUIStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-950">
              DevGuard Agent
            </h1>
            <p className="text-xs text-slate-500">AIOps Console</p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block truncate text-xs text-slate-500">{item.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
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
      </div>
    </aside>
  );
};

export default Sidebar;
