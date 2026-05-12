import { GlowButton } from '@/components/ui/GlowButton';
import { useUIStore } from '@/stores/uiStore';
import { Activity, Menu, Route, Shield, Zap } from 'lucide-react';

const Topbar = () => {
  const { toggleSidebar, toggleAIOps, chatMode, setChatMode } = useUIStore();
  const itemClass =
    'flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 text-sm font-medium text-white transition-colors hover:bg-white/10';

  return (
    <div className="flex h-16 items-center border-b border-white/10 bg-slate-950/58 px-4 backdrop-blur-2xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={toggleSidebar}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] transition-colors hover:bg-white/10 md:hidden"
          aria-label="打开侧边栏"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
          <div className={`${itemClass} border-emerald-300/20 bg-emerald-300/10`}>
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)] animate-pulse" />
            <span>在线</span>
          </div>

          <button
            type="button"
            className={`${itemClass} flex-shrink-0 ${
              chatMode === 'quick'
                ? 'border-cyan-300/35 bg-cyan-300/10'
                : ''
            }`}
            onClick={() => setChatMode(chatMode === 'quick' ? 'stream' : 'quick')}
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span>{chatMode === 'quick' ? '快速模式' : '流式模式'}</span>
          </button>

          <div className={itemClass}>
            <Shield className="w-4 h-4 text-green-400" />
            <span>安全</span>
          </div>

          <div className={itemClass}>
            <Route className="h-4 w-4 text-amber-300" />
            <span>Trace Ready</span>
          </div>

          <GlowButton
            variant="secondary"
            onClick={toggleAIOps}
            className="h-10 flex-shrink-0 px-3"
          >
            <Activity className="w-4 h-4" />
            AI Ops
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
