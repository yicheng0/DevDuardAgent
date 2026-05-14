import { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { User, Bot, Loader2, Star } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';

interface MessageProps {
  message: MessageType;
  compact?: boolean;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

const Message = ({ message, compact = false }: MessageProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSavingImportant, setIsSavingImportant] = useState(false);
  const isUser = message.role === 'user';
  const canToggleImportant = message.role === 'assistant' && Boolean(message.taskId) && !message.isStreaming;
  const { updateMessageImportant } = useChatStore();

  useEffect(() => {
    if (contentRef.current && message.role === 'assistant') {
      // Apply syntax highlighting to code blocks
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [message.content, message.role]);

  const renderContent = () => {
    if (message.role === 'assistant') {
      return (
        <div
          ref={contentRef}
          className={`prose prose-slate max-w-none ${compact ? 'prose-xs text-xs leading-5' : 'prose-sm'}`}
          dangerouslySetInnerHTML={{ __html: marked(message.content) }}
        />
      );
    }
    return <p className="whitespace-pre-wrap text-white">{message.content}</p>;
  };

  const toggleImportant = async () => {
    if (!message.taskId || isSavingImportant) return;
    const nextImportant = !message.important;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    setIsSavingImportant(true);
    try {
      const response = await fetch('/api/tasks/important', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: message.taskId, important: nextImportant }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok || body.message !== 'OK') {
        throw new Error(body.message || '标记重要失败');
      }
      const task = body.data?.task;
      updateMessageImportant(message.taskId, Boolean(task?.important ?? nextImportant));
    } catch (error) {
      console.error('Toggle important failed:', error);
    } finally {
      window.clearTimeout(timeout);
      setIsSavingImportant(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`${compact ? 'mb-3 gap-2' : 'mb-4 gap-3'} flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="shrink-0">
          <div
            className={`flex items-center justify-center rounded-md bg-[#f7ebe5] text-[#7f432f] ring-1 ring-[#ead1c5] ${
              compact ? 'h-7 w-7' : 'h-8 w-8'
            }`}
          >
            <Bot className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </div>
        </div>
      )}

      <div
        className={`${compact ? 'max-w-[88%] px-2.5 py-1.5 text-xs leading-5' : 'max-w-[82%] px-3 py-2 text-sm leading-6'} rounded-lg border ${
          isUser
            ? 'border-[#9a563f] bg-[#9a563f] text-white'
            : 'border-[#ead7b7] bg-[#fff6e8] text-slate-800'
        }`}
      >
        {canToggleImportant && (
          <div className="mb-1 flex justify-end">
            <button
              type="button"
              onClick={toggleImportant}
              disabled={isSavingImportant}
              className={`brand-focus-ring inline-flex shrink-0 items-center justify-center rounded-md border transition-colors ${
                compact ? 'h-7 w-7' : 'h-8 w-8'
              } ${
                message.important
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-[#ead7b7] bg-[#fffdf8] text-slate-400 hover:text-[#9a563f]'
              } disabled:opacity-60`}
              aria-label={message.important ? '取消重要记录' : '标记为重要记录'}
              title={message.important ? '取消重要记录' : '标记为重要记录'}
            >
              {isSavingImportant ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Star className={`h-3.5 w-3.5 ${message.important ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>
        )}
        {renderContent()}
        {message.isStreaming && (
          <motion.span
            className="ml-1 inline-block h-4 w-1.5 bg-[#9a563f]"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {isUser && (
        <div className="shrink-0">
          <div
            className={`flex items-center justify-center rounded-md bg-[#fff6e8] text-[#7f432f] ring-1 ring-[#ead7b7] ${
              compact ? 'h-7 w-7' : 'h-8 w-8'
            }`}
          >
            <User className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Message;
