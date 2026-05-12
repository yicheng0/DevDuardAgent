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
  phase?: 'understand' | 'retrieve' | 'observe' | 'reason' | 'respond';
  toolName?: string;
  description?: string;
  result?: string;
  evidence?: string[];
  durationMs?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
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
