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
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(message.content) }}
        />
      );
    }
    return <p className="text-white whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] ${
          isUser
            ? 'border border-cyan-300/30 bg-gradient-to-br from-cyan-600/85 to-blue-700/85 text-white'
            : 'border border-white/10 bg-slate-950/72 text-slate-100 backdrop-blur-xl'
        }`}
      >
        {renderContent()}
        {message.isStreaming && (
          <motion.span
            className="inline-block w-2 h-4 ml-1 bg-blue-400"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Message;
