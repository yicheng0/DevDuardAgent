import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useUIStore } from '@/stores/uiStore';
import { Menu, Zap, Shield, Activity } from 'lucide-react';

const Topbar = () => {
  const { toggleSidebar, toggleAIOps, chatMode, setChatMode } = useUIStore();

  return (
    <div className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
      {/* Left: Menu & Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green animate-pulse" />
            <span className="text-sm text-white font-medium">在线</span>
          </div>

          <div
            className={`px-4 py-2 rounded-lg border cursor-pointer transition-all ${
              chatMode === 'quick'
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
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

          <div className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white font-medium">安全</span>
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
