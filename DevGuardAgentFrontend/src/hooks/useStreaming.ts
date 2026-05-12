import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAIOpsStore } from '@/stores/aiopsStore';

export const useStreaming = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { updateStreamingMessage, setStreaming } = useChatStore();
  const { completeTrace, failTrace } = useAIOpsStore();

  const startStreaming = (sessionId: string, message: string, file?: File | null) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStreaming(true);
    updateStreamingMessage('');

    // Build URL with query parameters
    const params = new URLSearchParams({
      session_id: sessionId,
      message: message,
    });

    // For file upload, we need to use POST with FormData
    if (file) {
      handleFileUploadStreaming(sessionId, message, file);
      return;
    }

    // Create EventSource for streaming
    const eventSource = new EventSource(`/api/chat_stream?${params.toString()}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.content) {
          updateStreamingMessage(data.content);
        }
        if (data.done) {
          eventSource.close();
          setStreaming(false);
          completeTrace('Agent 已完成流式分析，并生成可执行的处置建议。');
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
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
      formData.append('session_id', sessionId);
      formData.append('message', message);
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                updateStreamingMessage(data.content);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
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
