export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIOpsStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
  result?: string;
}

export interface AIOpsResult {
  steps: AIOpsStep[];
  finalReport?: string;
}

export type ChatMode = 'quick' | 'stream';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}
