import { useMemo, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatSession } from '@/types';
import { motion } from 'framer-motion';
import { History, MessageSquare, Plus, Search, Shield, Trash2 } from 'lucide-react';

const getSessionGroup = (date: Date) => {
  const now = new Date();
  const sessionDate = new Date(date);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfSessionDay = new Date(
    sessionDate.getFullYear(),
    sessionDate.getMonth(),
    sessionDate.getDate()
  );
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfSessionDay.getTime()) / 86400000
  );

  if (diffDays <= 0) return '今天';
  if (diffDays < 7) return '最近 7 天';
  return '更早';
};

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  const groupedSessions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredSessions = normalizedQuery
      ? sessions.filter((session) => session.title.toLowerCase().includes(normalizedQuery))
      : sessions;

    return filteredSessions.reduce<Record<string, ChatSession[]>>((groups, session) => {
      const groupName = getSessionGroup(session.updatedAt);
      return {
        ...groups,
        [groupName]: [...(groups[groupName] || []), session],
      };
    }, {});
  }, [searchQuery, sessions]);

  const hasSessions = sessions.length > 0;
  const hasFilteredSessions = Object.values(groupedSessions).some((group) => group.length > 0);

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-white/10 bg-slate-950/86 px-3 py-4 shadow-[18px_0_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-white">
              DevGuard Agent
            </h1>
            <p className="text-xs text-slate-400">AI Security Workspace</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleNewChat}
        className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/35"
      >
        <Plus className="h-4 w-4" />
        新建对话
      </button>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="搜索历史任务"
          className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.035] pl-9 pr-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-300/35 focus:bg-white/[0.055]"
        />
      </div>

      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <History className="h-4 w-4 text-cyan-200" />
          任务历史
        </h3>
        <span className="text-xs text-slate-500">{sessions.length}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.28)_transparent]">
        {!hasSessions && (
          <div className="mt-10 px-5 text-center">
            <MessageSquare className="mx-auto h-7 w-7 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">暂无历史任务</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">创建一次 Agent 分析后会出现在这里。</p>
          </div>
        )}

        {hasSessions && !hasFilteredSessions && (
          <div className="mt-10 px-5 text-center">
            <Search className="mx-auto h-7 w-7 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">没有匹配的历史任务</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">换一个关键词再试试。</p>
          </div>
        )}

        {['今天', '最近 7 天', '更早'].map((groupName) => {
          const groupSessions = groupedSessions[groupName] || [];
          if (groupSessions.length === 0) return null;

          return (
            <div key={groupName} className="mb-4">
              <p className="mb-1.5 px-2 text-xs font-medium text-slate-500">{groupName}</p>
              <div className="space-y-1">
                {groupSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.025 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className={`group relative flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.055] focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
                        currentSessionId === session.id
                          ? 'bg-cyan-300/10 text-white'
                          : 'text-slate-300'
                      }`}
                      onClick={() => switchSession(session.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          switchSession(session.id);
                        }
                      }}
                    >
                      {currentSessionId === session.id && (
                        <span className="absolute left-0 top-2 h-6 w-0.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                      )}
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-cyan-200" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{session.title}</span>
                        <span className="block text-xs text-slate-500">
                          {formatTime(session.updatedAt)}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="删除对话"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-500 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-200">Agent runtime healthy</p>
          <p className="text-xs text-slate-500">5 phases · AIOps</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
