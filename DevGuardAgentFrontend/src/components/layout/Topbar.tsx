import { useUIStore } from '@/stores/uiStore';
import { Activity, Menu, Play, Route, Shield, Zap } from 'lucide-react';

const Topbar = () => {
  const { toggleSidebar, toggleAIOps, chatMode, setChatMode } = useUIStore();
  const actionClass =
    'flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-sm font-medium text-slate-100 transition-colors hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/35';
  const statusClass =
    'flex h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-2.5 text-xs font-medium text-slate-300';

  return (
    <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 bg-slate-950/58 px-4 backdrop-blur-2xl lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] transition-colors hover:bg-white/10 md:hidden"
          aria-label="打开侧边栏"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">DevGuard Agent</div>
          <div className="hidden text-xs text-slate-400 sm:block">Agent Trace Workspace</div>
        </div>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <div className={`${statusClass} border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-100`}>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          在线
        </div>
        <div className={statusClass}>
          <Shield className="h-3.5 w-3.5 text-emerald-300" />
          安全
        </div>
        <div className={statusClass}>
          <Route className="h-3.5 w-3.5 text-amber-300" />
          Trace Ready
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" className={`${actionClass} hidden sm:flex`}>
          <Play className="h-4 w-4 text-slate-300" />
          Preview
        </button>

        <button
          type="button"
          className={`${actionClass} ${
            chatMode === 'quick' ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-50' : ''
          }`}
          onClick={() => setChatMode(chatMode === 'quick' ? 'stream' : 'quick')}
        >
          <Zap className="h-4 w-4 text-cyan-300" />
          <span>{chatMode === 'quick' ? 'Quick' : 'Stream'}</span>
        </button>

        <button
          type="button"
          onClick={toggleAIOps}
          className="flex h-9 flex-shrink-0 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-400 px-3 text-sm font-semibold text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.24)] transition-colors hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200/70"
        >
          <Activity className="h-4 w-4" />
          Agent Trace
        </button>
      </div>
    </div>
  );
};

export default Topbar;
