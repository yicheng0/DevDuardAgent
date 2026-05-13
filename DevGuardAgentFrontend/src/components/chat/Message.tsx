import { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef } from 'react';

interface MessageProps {
  message: MessageType;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

const Message = ({ message }: MessageProps) => {
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
          className="prose prose-slate prose-sm max-w-none"
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
      className={`mb-4 flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Bot className="h-4 w-4" />
          </div>
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-lg border px-3 py-2 text-sm leading-6 ${
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <User className="h-4 w-4" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Message;
