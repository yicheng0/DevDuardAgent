import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentTask, ChatSession, Message } from '@/types';

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isStreaming: boolean;
  streamingContent: string;

  // Actions
  createSession: () => void;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateStreamingMessage: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  restoreSessionFromTask: (task: AgentTask) => void;
  clearMessages: () => void;
  getCurrentSession: () => ChatSession | null;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isStreaming: false,
      streamingContent: '',

      createSession: () => {
        const newSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: '新对话',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
      },

      deleteSession: (id: string) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          const newCurrentId =
            state.currentSessionId === id
              ? newSessions[0]?.id || null
              : state.currentSessionId;
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
          };
        });
      },

      switchSession: (id: string) => {
        set({ currentSessionId: id });
      },

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
        };

        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === state.currentSessionId) {
              const messages = [...session.messages, newMessage];
              // Update title based on first user message
              const title =
                session.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                  : session.title;
              return {
                ...session,
                messages,
                title,
                updatedAt: new Date(),
              };
            }
            return session;
          });
          return { sessions };
        });
      },

      updateStreamingMessage: (content: string) => {
        set({ streamingContent: content });
      },

      setStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
        if (!isStreaming && get().streamingContent) {
          // Finalize streaming message
          get().addMessage({
            role: 'assistant',
            content: get().streamingContent,
          });
          set({ streamingContent: '' });
        }
      },

      restoreSessionFromTask: (task) => {
        const parseTaskDate = (value?: string) => {
          if (!value) return new Date();
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? new Date() : date;
        };
        const userTime = parseTaskDate(task.startedAt || task.createdAt);
        const assistantTime = parseTaskDate(task.finishedAt || task.updatedAt);
        const messages: Message[] = [];

        if (task.question) {
          messages.push({
            id: `${task.id}-question`,
            role: 'user',
            content: task.question,
            timestamp: userTime,
          });
        }
        if (task.answer) {
          messages.push({
            id: `${task.id}-answer`,
            role: 'assistant',
            content: task.answer,
            timestamp: assistantTime,
          });
        }

        const restoredSession: ChatSession = {
          id: task.sessionId || `session-${task.id}`,
          title: task.title || task.question.slice(0, 30) || '历史任务',
          messages,
          createdAt: userTime,
          updatedAt: assistantTime,
        };

        set((state) => {
          const exists = state.sessions.some((session) => session.id === restoredSession.id);
          return {
            sessions: exists
              ? state.sessions.map((session) =>
                  session.id === restoredSession.id
                    ? {
                        ...session,
                        title: session.title || restoredSession.title,
                        messages: session.messages.length ? session.messages : restoredSession.messages,
                        updatedAt: session.updatedAt || restoredSession.updatedAt,
                      }
                    : session
                )
              : [restoredSession, ...state.sessions],
            currentSessionId: restoredSession.id,
          };
        });
      },

      clearMessages: () => {
        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === state.currentSessionId) {
              return {
                ...session,
                messages: [],
                updatedAt: new Date(),
              };
            }
            return session;
          });
          return { sessions };
        });
      },

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.currentSessionId) || null;
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
