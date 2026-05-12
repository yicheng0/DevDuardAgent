import { GlowButton } from '@/components/ui/GlowButton';
import { useUIStore } from '@/stores/uiStore';
import { Activity, Menu, Route, Shield, Zap } from 'lucide-react';

const Topbar = () => {
  const { toggleSidebar, toggleAIOps, chatMode, setChatMode } = useUIStore();

  return (
    <div className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/58 px-6 backdrop-blur-2xl">
      {/* Left: Menu & Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg border border-white/10 bg-white/[0.045] p-2 transition-colors hover:bg-white/10 md:hidden"
          aria-label="打开侧边栏"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Status Pills */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)] animate-pulse" />
            <span className="text-sm text-white font-medium">在线</span>
          </div>

          <div
            className={`cursor-pointer rounded-lg border px-4 py-2 transition-all ${
              chatMode === 'quick'
                ? 'border-cyan-300/35 bg-cyan-300/10'
                : 'border-white/10 bg-white/[0.045] hover:bg-white/10'
            }`}
            onClick={() => setChatMode(chatMode === 'quick' ? 'stream' : 'quick')}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white font-medium">
                {chatMode === 'quick' ? '快速模式' : '流式模式'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white font-medium">安全</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2">
            <Route className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-medium text-white">Trace Ready</span>
          </div>
        </div>
      </div>

      {/* Right: AI Ops Button */}
      <GlowButton
        variant="secondary"
        onClick={toggleAIOps}
        className="flex items-center gap-2"
      >
        <Activity className="w-5 h-5" />
        AI Ops
      </GlowButton>
    </div>
  );
};

export default Topbar;
