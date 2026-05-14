import MessageList from './MessageList';
import InputArea from './InputArea';
import { Loader2, MessageSquarePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';

interface ChatContainerProps {
  compact?: boolean;
}

const ChatContainer = ({ compact = false }: ChatContainerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const { sessions, currentSessionId, createSession, deleteSession, switchSession, getCurrentSession } = useChatStore();
  const session = getCurrentSession();

  const handleDeleteSession = async () => {
    if (!currentSessionId || isDeleting) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    setIsDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/chat/sessions?id=${encodeURIComponent(currentSessionId)}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || '删除会话失败');
      }
      deleteSession(currentSessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除会话失败');
    } finally {
      window.clearTimeout(timeout);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fffdf8]">
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#ead7b7] bg-[#fffdf8] px-3 py-2">
          <select
            value={currentSessionId || ''}
            onChange={(event) => switchSession(event.target.value)}
            className="brand-input h-9 min-w-0 flex-1 rounded-md border px-2 text-sm text-slate-700"
            aria-label="选择聊天会话"
          >
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title || '新对话'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createSession}
            className="brand-subtle-button inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold"
          >
            <MessageSquarePlus className="h-4 w-4" />
            新建
          </button>
          <button
            type="button"
            onClick={handleDeleteSession}
            disabled={!session || isDeleting}
            className="brand-subtle-button inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold text-red-700 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            删除
          </button>
          {error && <p className="basis-full text-xs text-red-600">{error}</p>}
        </div>
      )}
      <MessageList compact={compact} />
      <InputArea compact={compact} />
    </div>
  );
};

export default ChatContainer;
