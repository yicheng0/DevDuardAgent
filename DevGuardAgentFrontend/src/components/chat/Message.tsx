import { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef } from 'react';

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
  const isUser = message.role === 'user';

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
            className={`flex items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100 ${
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
            ? 'border-blue-200 bg-blue-600 text-white'
            : 'border-slate-200 bg-slate-50 text-slate-800'
        }`}
      >
        {renderContent()}
        {message.isStreaming && (
          <motion.span
            className="ml-1 inline-block h-4 w-1.5 bg-blue-500"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {isUser && (
        <div className="shrink-0">
          <div
            className={`flex items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200 ${
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
