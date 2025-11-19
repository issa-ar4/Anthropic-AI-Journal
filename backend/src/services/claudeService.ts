import Anthropic from '@anthropic-ai/sdk';
import {
  AnalysisResult,
  Emotion,
  CognitiveDistortion,
  CausalLink,
} from '../types/analysis.types';

// Check if API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not configured in environment variables');
  throw new Error('Anthropic API key is required but not configured');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('✅ Anthropic SDK initialized successfully');

export class ClaudeService {
  /**
   * Analyze a single journal entry using Claude
   */
  async analyzeEntry(
    entryId: string,
    content: string,
    title?: string
  ): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(content, title);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: this.getSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const analysis = this.parseAnalysisResponse(responseText, entryId);
    
    return analysis;
  }

  /**
   * Analyze multiple entries to find patterns
   */
  async findPatterns(entries: Array<{ id: string; content: string; title?: string; createdAt: Date }>): Promise<{
    patterns: Array<{
      type: string;
      description: string;
      relatedEntryIds: string[];
      frequency: number;
    }>;
  }> {
    if (entries.length === 0) {
      return { patterns: [] };
    }

    const entriesText = entries
      .map((e, idx) => `Entry ${idx + 1} (${e.createdAt.toLocaleDateString()}):\nTitle: ${e.title || 'Untitled'}\n${e.content}`)
      .join('\n\n---\n\n');

    const prompt = `Analyze these journal entries and identify recurring patterns, themes, triggers, and behavioral patterns. Look for:
1. Recurring themes or topics
2. Common triggers or situations
3. Behavioral patterns
4. Thought patterns that repeat

Entries:
${entriesText}

Return your analysis in JSON format:
{
  "patterns": [
    {
      "type": "recurring_theme | trigger | behavioral | thought_pattern",
      "description": "Clear description of the pattern",
      "relatedEntryIndices": [array of entry numbers where this appears],
      "frequency": number of occurrences
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: 'You are a psychological pattern recognition expert. Analyze journal entries to identify meaningful patterns.',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const result = this.parseJSON(responseText);

    // Map entry indices to actual IDs
    const patterns = result.patterns?.map((p: any) => ({
      ...p,
      relatedEntryIds: p.relatedEntryIndices?.map((idx: number) => entries[idx - 1]?.id).filter(Boolean) || [],
    })) || [];

    return { patterns };
  }

  private getSystemPrompt(): string {
    return `You are an expert psychological analyst specializing in cognitive behavioral therapy and emotional intelligence. Your role is to analyze journal entries and provide:

1. Emotion identification with intensity scores
2. Sentiment analysis
3. Cognitive distortion detection (if present)
4. Causal relationship inference
5. Key themes
6. Supportive summary

Be empathetic, non-judgmental, and constructive. Focus on helping the user understand their thoughts and emotions.`;
  }

  private buildAnalysisPrompt(content: string, title?: string): string {
    return `Analyze this journal entry and provide a detailed psychological analysis.

${title ? `Title: ${title}\n` : ''}Content: ${content}

Please provide your analysis in the following JSON format:
{
  "emotions": [
    {
      "name": "emotion name (e.g., joy, sadness, anxiety)",
      "intensity": 0-100,
      "category": "positive | negative | neutral"
    }
  ],
  "sentiment": {
    "overall": "positive | negative | neutral | mixed",
    "score": -1 to 1 (negative to positive)
  },
  "cognitiveDistortions": [
    {
      "type": "distortion type (e.g., catastrophizing, black-and-white thinking)",
      "description": "what the distortion is",
      "severity": "low | medium | high",
      "explanation": "why this is a cognitive distortion",
      "suggestion": "how to reframe this thinking"
    }
  ],
  "causalLinks": [
    {
      "cause": "what triggered or caused something",
      "effect": "the result or consequence",
      "confidence": 0-1,
      "reasoning": "why you believe this connection exists"
    }
  ],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "summary": "A brief, empathetic summary of the entry (2-3 sentences)"
}

Important:
- Only include cognitive distortions if they are clearly present
- Be specific and evidence-based in your analysis
- Focus on being helpful and supportive`;
  }

  private parseAnalysisResponse(response: string, entryId: string): AnalysisResult {
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        entryId,
        emotions: parsed.emotions || [],
        sentiment: parsed.sentiment || { overall: 'neutral', score: 0 },
        cognitiveDistortions: parsed.cognitiveDistortions || [],
        causalLinks: parsed.causalLinks || [],
        keyThemes: parsed.keyThemes || [],
        summary: parsed.summary || 'Analysis completed.',
      };
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      // Return a minimal valid response
      return {
        entryId,
        emotions: [],
        sentiment: { overall: 'neutral', score: 0 },
        cognitiveDistortions: [],
        causalLinks: [],
        keyThemes: [],
        summary: 'Unable to complete detailed analysis.',
      };
    }
  }

  private parseJSON(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      return {};
    }
  }
}

export const claudeService = new ClaudeService();
