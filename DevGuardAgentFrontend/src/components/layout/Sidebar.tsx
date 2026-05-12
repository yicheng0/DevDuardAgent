import { GlowButton } from '@/components/ui/GlowButton';
import { useChatStore } from '@/stores/chatStore';
import { motion } from 'framer-motion';
import { History, Plus, Shield, Trash2, Workflow } from 'lucide-react';

const Sidebar = () => {
  const { sessions, currentSessionId, createSession, deleteSession, switchSession } =
    useChatStore();

  const handleNewChat = () => {
    createSession();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-white/10 bg-slate-950/82 p-5 shadow-[18px_0_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      {/* Logo */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">DevGuard Agent</h1>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">AI Security</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <GlowButton
        onClick={handleNewChat}
        className="w-full mb-6 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        新建对话
      </GlowButton>

      {/* Workflow Indicator */}
      <div className="premium-panel mb-6 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)] animate-pulse" />
          <div>
            <p className="text-sm font-medium text-white">正常运行</p>
            <p className="text-xs text-slate-400">Agent runtime healthy</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <p className="text-slate-500">链路</p>
            <p className="mt-1 font-medium text-cyan-100">5 phases</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <p className="text-slate-500">模式</p>
            <p className="mt-1 font-medium text-emerald-100">AIOps</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          <History className="h-4 w-4 text-cyan-200" />
          任务历史
        </h3>
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`group cursor-pointer rounded-xl border p-3 transition-all hover:bg-white/[0.07] ${
                  currentSessionId === session.id
                    ? 'border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                    : 'border-white/10 bg-white/[0.035]'
                }`}
                onClick={() => switchSession(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{session.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      <Workflow className="mr-1 inline h-3 w-3" />
                      {formatTime(session.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
