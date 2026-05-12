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
          <div className="text-center">
            <p className="text-slate-400 text-lg">开始新的对话</p>
            <p className="text-slate-500 text-sm mt-2">输入消息开始与 AI 助手交流</p>
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
