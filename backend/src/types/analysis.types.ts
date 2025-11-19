export interface Emotion {
  name: string;
  intensity: number; // 0-100
  category: 'positive' | 'negative' | 'neutral';
}

export interface Pattern {
  type: 'recurring_theme' | 'trigger' | 'behavioral' | 'thought_pattern';
  description: string;
  frequency: number;
  relatedEntryIds: string[];
  firstDetected: Date;
  lastDetected: Date;
}

export interface CognitiveDistortion {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  suggestion: string;
}

export interface CausalLink {
  cause: string;
  effect: string;
  confidence: number; // 0-1
  reasoning: string;
}

export interface AnalysisResult {
  entryId: string;
  emotions: Emotion[];
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    score: number; // -1 to 1
  };
  cognitiveDistortions: CognitiveDistortion[];
  causalLinks: CausalLink[];
  keyThemes: string[];
  summary: string;
}

export interface InsightData {
  emotionalTrends: {
    date: string;
    emotions: { [emotionName: string]: number };
  }[];
  topPatterns: Pattern[];
  mostCommonDistortions: {
    type: string;
    count: number;
  }[];
  overallSentimentTrend: {
    date: string;
    score: number;
  }[];
}
