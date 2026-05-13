import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const Topbar = () => {
  const { toggleSidebar, toggleSidebarCollapsed, toggleConfig, activeNav, isSidebarCollapsed } =
    useUIStore();

  const title =
    activeNav === 'overview'
      ? '运维总览'
      : activeNav === 'alerts'
        ? '告警处置'
        : activeNav === 'logs'
          ? '日志分析'
          : activeNav === 'metrics'
            ? '指标健康'
            : activeNav === 'knowledge'
              ? '知识库'
              : activeNav === 'trace'
                ? 'Agent Trace'
                : activeNav === 'history'
                  ? '任务历史'
                  : '系统设置';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 md:hidden"
          aria-label="打开侧边栏"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 md:flex"
          aria-label={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          title={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-950">{title}</h2>
          <p className="hidden text-xs text-slate-500 sm:block">Runtime console · online configuration</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggleConfig}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <Settings className="h-4 w-4" />
          <span>配置</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
