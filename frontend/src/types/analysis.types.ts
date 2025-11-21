export interface Emotion {
  name: string;
  intensity: number;
  category: 'positive' | 'negative' | 'neutral';
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
  confidence: number;
  reasoning: string;
}

export interface Analysis {
  id: string;
  entryId: string;
  emotions: Emotion[];
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    score: number;
  };
  cognitiveDistortions: CognitiveDistortion[];
  causalLinks: CausalLink[];
  keyThemes: string[];
  summary: string;
  createdAt: string;
}

export interface Pattern {
  id: string;
  userId: string;
  type: 'recurring_theme' | 'trigger' | 'behavioral' | 'thought_pattern';
  description: string;
  frequency: number;
  relatedEntryIds: string[];
  firstDetected: string;
  lastDetected: string;
}

export interface TriggerTimingData {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
  avgSentiment: number;
}

export interface DistortionImpact {
  type: string;
  count: number;
  avgSentiment: number;
  severity: number;
}

export interface EmotionRadarData {
  emotion: string;
  intensity: number;
  category: 'positive' | 'negative' | 'neutral';
}

export interface ThemeBubble {
  theme: string;
  count: number;
  avgSentiment: number;
}

export interface RecoveryMetrics {
  averageRecoveryDays: number;
  fastestRecoveryDays: number;
  slowestRecoveryDays: number;
  totalRecoveryEvents: number;
  improvementTrend: number;
}

export interface PatternTrend {
  patternId: string;
  weeklyFrequency: number[];
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
  // New enhanced data
  triggerTiming?: TriggerTimingData[];
  distortionImpacts?: DistortionImpact[];
  emotionRadar?: EmotionRadarData[];
  themeBubbles?: ThemeBubble[];
  recoveryMetrics?: RecoveryMetrics;
  patternTrends?: PatternTrend[];
}

export interface AnalyzeResponse {
  analysis: Analysis;
  cached: boolean;
}

export interface BatchAnalyzeResponse {
  results: {
    entryId: string;
    analysis: Analysis;
    cached: boolean;
  }[];
}

export interface DetectPatternsResponse {
  patterns: Pattern[];
  message?: string;
}
