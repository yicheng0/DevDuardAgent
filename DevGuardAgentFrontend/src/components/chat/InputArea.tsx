import { useState, useRef, KeyboardEvent } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { Paperclip, Send, ChevronDown } from 'lucide-react';
import { useStreaming } from '@/hooks/useStreaming';

const InputArea = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMessage, currentSessionId, createSession } = useChatStore();
  const { chatMode, setChatMode } = useUIStore();
  const { startStreaming } = useStreaming();

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    // Create session if none exists
    if (!currentSessionId) {
      createSession();
    }

    // Add user message
    addMessage({
      role: 'user',
      content: input.trim(),
    });

    const userMessage = input.trim();
    setInput('');
    setFile(null);

    // Send to backend
    if (chatMode === 'stream') {
      startStreaming(currentSessionId!, userMessage, file);
    } else {
      // Quick mode - non-streaming
      try {
        const formData = new FormData();
        formData.append('session_id', currentSessionId!);
        formData.append('message', userMessage);
        if (file) {
          formData.append('file', file);
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        addMessage({
          role: 'assistant',
          content: data.response || '抱歉，我无法回答这个问题。',
        });
      } catch (error) {
        console.error('Chat error:', error);
        addMessage({
          role: 'assistant',
          content: '抱歉，发生了错误，请稍后重试。',
        });
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
        <div className="flex items-end gap-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            title="上传文件"
          >
            <Paperclip className="w-5 h-5 text-slate-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".txt,.md,.markdown"
          />

          {/* Textarea */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Shift+Enter 换行)"
              className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 resize-none min-h-[48px] max-h-[200px]"
              rows={1}
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Paperclip className="w-4 h-4" />
                <span>{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setChatMode(chatMode === 'quick' ? 'stream' : 'quick')}
              className="px-3 py-2 bg-slate-700 rounded-lg text-sm text-white flex items-center gap-1 hover:bg-slate-600 transition-colors border border-slate-600"
            >
              {chatMode === 'quick' ? '快速' : '流式'}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <GlowButton
            onClick={handleSend}
            disabled={!input.trim() && !file}
            className="flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
