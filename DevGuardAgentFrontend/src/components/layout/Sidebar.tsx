import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useChatStore } from '@/stores/chatStore';
import { motion } from 'framer-motion';
import { Plus, Shield, Trash2 } from 'lucide-react';

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
    <div className="w-[280px] h-full bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold text-white">DevGuard Agent</h1>
            <p className="text-xs text-slate-400">AI Security</p>
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
      <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-glow-green animate-pulse" />
          <div>
            <p className="text-sm font-medium text-white">正常运行</p>
            <p className="text-xs text-slate-400">系统健康</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-slate-300 mb-3">聊天历史</h3>
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`p-3 cursor-pointer group hover:bg-slate-700 rounded-xl border transition-all ${
                  currentSessionId === session.id
                    ? 'border-blue-500 bg-slate-700/50'
                    : 'border-slate-600 bg-slate-700/30'
                }`}
                onClick={() => switchSession(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{session.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
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
