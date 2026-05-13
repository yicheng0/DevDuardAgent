import { useRef, useState, KeyboardEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { Paperclip, Send, X, Zap } from 'lucide-react';
import { useStreaming } from '@/hooks/useStreaming';

interface InputAreaProps {
  compact?: boolean;
}

const InputArea = ({ compact = false }: InputAreaProps) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMessage, currentSessionId, createSession } = useChatStore();
  const { chatMode, setChatMode } = useUIStore();
  const { startDemoTrace, completeTrace, failTrace } = useAIOpsStore();
  const { startStreaming } = useStreaming();

  const ensureSessionId = () => {
    if (currentSessionId) return currentSessionId;
    createSession();
    return useChatStore.getState().currentSessionId;
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const sessionId = ensureSessionId();
    const userMessage = input.trim();

    addMessage({
      role: 'user',
      content: userMessage || `分析上传文件：${file?.name}`,
    });

    setInput('');
    setFile(null);
    startDemoTrace(userMessage || file?.name || '分析上传材料', Boolean(file));

    if (!sessionId) return;

    if (chatMode === 'stream') {
      startStreaming(sessionId, userMessage, file);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Id', sessionId);
      formData.append('Question', userMessage);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const body = await response.json();
      const data = body.data || body;
      addMessage({
        role: 'assistant',
        content: data.answer || data.response || '抱歉，我无法回答这个问题。',
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, compact ? 84 : 120)}px`;
    }
  };

  return (
    <div className={`border-t border-slate-200 bg-white ${compact ? 'p-2.5' : 'p-3'}`}>
      <div
        className={`mb-2 grid grid-cols-1 gap-2 sm:items-center ${
          compact ? 'sm:grid-cols-1' : 'sm:grid-cols-[minmax(0,1fr)_auto]'
        }`}
      >
        <div
          className={`grid w-full grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 ${
            compact ? '' : 'sm:w-[184px]'
          }`}
          aria-label="响应模式"
        >
          {(['stream', 'quick'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setChatMode(mode)}
              className={`brand-focus-ring inline-flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition-colors ${
                chatMode === mode
                  ? 'bg-white text-[#7f432f] shadow-sm'
                  : 'text-slate-500 hover:text-[#7f432f]'
              }`}
            >
              {mode === 'stream' && <Zap className="h-3.5 w-3.5" />}
              <span className="truncate">{mode === 'stream' ? '流式' : '快速'}</span>
            </button>
          ))}
        </div>
        <span className={`hidden whitespace-nowrap text-xs text-slate-500 ${compact ? '' : 'sm:inline'}`}>
          Enter 发送，Shift+Enter 换行
        </span>
      </div>

      {file && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="flex min-w-0 items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="brand-focus-ring cursor-pointer rounded text-slate-500 transition-colors hover:text-red-600"
            aria-label="移除文件"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className={`brand-focus-within grid items-end gap-2 rounded-lg border border-slate-300 bg-white ${
          compact ? 'grid-cols-[36px_minmax(0,1fr)_36px] p-1.5' : 'grid-cols-[40px_minmax(0,1fr)_40px] p-2'
        }`}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`brand-icon-button flex shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500 ${
            compact ? 'h-9 w-9' : 'h-10 w-10'
          }`}
          title="上传文件"
          aria-label="上传文件"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".txt,.md,.markdown"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="询问 Agent，或描述需要分析的告警..."
          className={`min-w-0 resize-none border-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400 ${
            compact ? 'min-h-9 max-h-[84px] py-1.5 text-xs leading-5' : 'min-h-10 max-h-[120px] py-2 text-sm leading-5'
          }`}
          rows={1}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() && !file}
          className={`brand-button flex shrink-0 cursor-pointer items-center justify-center rounded-md p-0 disabled:cursor-not-allowed disabled:bg-slate-300 ${
            compact ? 'h-9 w-9' : 'h-10 w-10'
          }`}
          aria-label="发送"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
