import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { AgentTraceEvent } from '@/types';

export const useStreaming = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { updateStreamingMessage, setStreaming } = useChatStore();
  const { applyTraceEvent, completeTrace, failTrace } = useAIOpsStore();

  const startStreaming = (sessionId: string, message: string, file?: File | null) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStreaming(true);
    updateStreamingMessage('');

    // Build URL with query parameters
    const params = new URLSearchParams({
      Id: sessionId,
      Question: message,
    });

    // For file upload, we need to use POST with FormData
    if (file) {
      handleFileUploadStreaming(sessionId, message, file);
      return;
    }

    // Create EventSource for streaming
    const eventSource = new EventSource(`/api/chat_stream?${params.toString()}`);
    let accumulatedContent = '';
    let closed = false;
    const closeStream = () => {
      if (closed) return;
      closed = true;
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };

    eventSource.addEventListener('message', (event) => {
      try {
        const data = parseSSEData(event.data);
        if (data.content) {
          accumulatedContent += data.content;
          updateStreamingMessage(accumulatedContent);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    });

    eventSource.addEventListener('trace', (event) => {
      try {
        applyTraceEvent(JSON.parse(event.data) as AgentTraceEvent);
      } catch (error) {
        console.error('Error parsing trace data:', error);
      }
    });

    eventSource.addEventListener('done', (event) => {
      const data = parseSSEData((event as MessageEvent<string>).data || '{}');
      closeStream();
      setStreaming(false, { taskId: data.taskId, traceId: data.traceId });
      completeTrace('Agent 已完成流式分析，并生成可执行的处置建议。');
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE server error:', event);
      const message = parseSSEError(event, '流式通道异常，Agent 未能完成本次分析。');
      useChatStore.getState().addMessage({
        role: 'assistant',
        content: `请求失败：${message}`,
      });
      closeStream();
      setStreaming(false);
      failTrace(message);
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      useChatStore.getState().addMessage({
        role: 'assistant',
        content: '请求失败：流式通道连接异常，请检查后端服务或配置。',
      });
      closeStream();
      setStreaming(false);
      failTrace('流式通道异常，Agent 未能完成本次分析。');
    };

    eventSourceRef.current = eventSource;
  };

  const handleFileUploadStreaming = async (
    sessionId: string,
    message: string,
    file: File
  ) => {
    try {
      const formData = new FormData();
      formData.append('Id', sessionId);
      formData.append('Question', message);
      formData.append('file', file);

      const response = await fetch('/api/chat_stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      let eventName = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventName = line.slice(7).trim();
            continue;
          }
          if (!line.startsWith('data: ')) {
            continue;
          }
          handleStreamingEvent(eventName, line.slice(6));
          eventName = 'message';
        }
      }

      setStreaming(false);
      completeTrace('Agent 已完成附件解析、证据归纳和处置建议生成。');
    } catch (error) {
      console.error('File upload streaming error:', error);
      setStreaming(false);
      failTrace('附件分析链路异常，请检查文件内容或稍后重试。');
    }
  };

  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreaming(false);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { startStreaming, stopStreaming };
};

const handleStreamingEvent = (eventName: string, rawData: string) => {
  const { updateStreamingMessage, setStreaming } = useChatStore.getState();
  const { applyTraceEvent, completeTrace, failTrace } = useAIOpsStore.getState();

  try {
    if (eventName === 'trace') {
      applyTraceEvent(JSON.parse(rawData) as AgentTraceEvent);
      return;
    }
    if (eventName === 'done') {
      const data = parseSSEData(rawData);
      setStreaming(false, { taskId: data.taskId, traceId: data.traceId });
      completeTrace('Agent 已完成附件解析、证据归纳和处置建议生成。');
      return;
    }
    if (eventName === 'error') {
      const message = parseSSEData(rawData).content || parseSSEMessage(rawData) || '附件分析链路异常，请检查文件内容或稍后重试。';
      useChatStore.getState().addMessage({
        role: 'assistant',
        content: `请求失败：${message}`,
      });
      setStreaming(false);
      failTrace(message);
      return;
    }

    const data = parseSSEData(rawData);
    if (data.content) {
      const current = useChatStore.getState().streamingContent;
      updateStreamingMessage(`${current}${data.content}`);
    }
  } catch (error) {
    console.error('Error parsing streaming event:', error);
  }
};

const parseSSEData = (raw: string): { content?: string; taskId?: string; traceId?: string } => {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return { content: parsed };
    }
    if (typeof parsed?.message === 'string') {
      return { content: parsed.message };
    }
    return parsed;
  } catch {
    return { content: raw };
  }
};

const parseSSEError = (event: Event, fallback: string) => {
  const messageEvent = event as MessageEvent<string>;
  if (typeof messageEvent.data === 'string' && messageEvent.data) {
    return parseSSEData(messageEvent.data).content || parseSSEMessage(messageEvent.data) || fallback;
  }
  return fallback;
};

const parseSSEMessage = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.message === 'string' ? parsed.message : '';
  } catch {
    return '';
  }
};
