import { useChatStore } from '@/stores/chatStore';
import Message from './Message';
import { useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MessageList = () => {
  const { getCurrentSession, isStreaming, streamingContent } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = getCurrentSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, streamingContent]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {session.messages.length === 0 && !isStreaming ? (
        <div className="h-full flex items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-slate-950/58 p-8 text-center backdrop-blur-xl">
            <p className="text-lg font-medium text-white">开始新的 Agent 任务</p>
            <p className="mt-2 text-sm text-slate-400">输入安全问题后，右侧会同步展示推理轨迹。</p>
          </div>
        </div>
      ) : (
        <>
          {session.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isStreaming && streamingContent && (
            <Message
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date(),
                isStreaming: true,
              }}
            />
          )}
          {isStreaming && !streamingContent && (
            <div className="flex justify-start mb-4">
              <LoadingSpinner />
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
