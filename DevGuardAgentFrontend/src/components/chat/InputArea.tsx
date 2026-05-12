import { useState, useRef, KeyboardEvent } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { Paperclip, Send, ChevronDown } from 'lucide-react';
import { useStreaming } from '@/hooks/useStreaming';

const InputArea = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMessage, currentSessionId, createSession } = useChatStore();
  const { chatMode, setChatMode, isAIOpsOpen, toggleAIOps } = useUIStore();
  const { startDemoTrace, completeTrace, failTrace } = useAIOpsStore();
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
    startDemoTrace(userMessage || file?.name || '分析上传材料', Boolean(file));
    if (!isAIOpsOpen) {
      toggleAIOps();
    }

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
        completeTrace('Agent 已完成任务分析，并生成可执行的处置建议。');
      } catch (error) {
        console.error('Chat error:', error);
        addMessage({
          role: 'assistant',
          content: '抱歉，发生了错误，请稍后重试。',
        });
        failTrace('请求后端分析失败，Agent 未能完成本次处置链路。');
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
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex items-end gap-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
              className="min-h-[48px] max-h-[200px] w-full resize-none border-none bg-transparent text-white outline-none placeholder-slate-500"
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
              className="flex h-11 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-sm text-white transition-colors hover:bg-white/10"
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
