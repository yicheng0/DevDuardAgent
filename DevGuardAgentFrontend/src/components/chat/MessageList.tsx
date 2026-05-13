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
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      {session.messages.length === 0 && !isStreaming ? (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-semibold text-slate-950">等待 Agent 协同</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              运行告警分析或直接输入问题，Trace 会同步生成。
            </p>
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
            <div className="mb-4 flex justify-start">
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
