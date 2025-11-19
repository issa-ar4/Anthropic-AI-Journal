export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'abandoned';
  initialEmotion: string;
  rootCause?: string;
  turnCount: number;
  messages: SessionMessage[];
  metadata?: {
    themes?: string[];
    insights?: string[];
    emotionalProgression?: string[];
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateSessionRequest {
  initialEmotion: string;
}

export interface ContinueSessionRequest {
  userMessage: string;
}

export interface SessionResponse {
  session: Session;
  aiResponse?: string;
  isComplete?: boolean;
}
