import Anthropic from '@anthropic-ai/sdk';
import {
  AnalysisResult,
} from '../types/analysis.types';

// Lazy initialization of Anthropic client
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY is not configured in environment variables');
      throw new Error('Anthropic API key is required but not configured');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log('✅ Anthropic SDK initialized successfully');
  }
  return anthropic;
}

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

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
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

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
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

  /**
   * Conduct guided root cause analysis using Socratic questioning and 5 Whys
   */
  async conductGuidedAnalysis(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    turnCount: number
  ): Promise<{
    response: string;
    isComplete: boolean;
    rootCause?: string;
    themes?: string[];
  }> {
    const systemPrompt = this.getRootCauseSystemPrompt();

    // Build conversation history for Claude
    const conversationMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      temperature: 0.7,
      system: systemPrompt,
      messages: conversationMessages as any,
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Check if Claude has identified the root cause (indicated by specific markers)
    const isComplete = this.detectSessionCompletion(responseText, turnCount);
    
    // Extract root cause if session is complete
    let rootCause: string | undefined;
    let themes: string[] | undefined;

    if (isComplete) {
      const analysis = this.extractRootCauseAnalysis(responseText);
      rootCause = analysis.rootCause;
      themes = analysis.themes;
    }

    return {
      response: responseText,
      isComplete,
      rootCause,
      themes,
    };
  }

  private getRootCauseSystemPrompt(): string {
    return `You are a compassionate therapeutic guide specializing in root cause analysis. Your role is to help users discover the deep, underlying causes of their emotions through guided inquiry.

IMPORTANT: Write all your responses in plain, natural conversational text. Do NOT use any markdown formatting (no **, ##, -, •, etc.). Write as if you're having a genuine conversation with someone.

Your Approach:
1. Use the "5 Whys" technique combined with Socratic questioning
2. Ask ONE clear, probing question at a time
3. Move progressively deeper with each exchange
4. Be empathetic, non-judgmental, and create psychological safety
5. Listen for patterns, core beliefs, unmet needs, or past experiences

Guidelines:
- If the initial message lacks clear emotional content (just facts, events, or vague statements), gently guide them to explore their emotions by asking what they're feeling about the situation they described, or help them identify possible emotions they might be experiencing
- Start with gentle curiosity about their surface-level emotion
- Follow their answers to peel back layers systematically
- Look for:
  - Core beliefs ("I'm not good enough", "I must be perfect")
  - Unmet needs (belonging, autonomy, safety, recognition)
  - Past experiences or trauma patterns
  - Fear-based reactions vs. values-based responses
- Aim for 3-5 exchanges before reaching the root

Handling Initial Messages Without Clear Emotions:
If the user's first message doesn't express clear emotions (e.g., just describes a situation, states facts, or is vague), respond empathetically by:
1. Acknowledging what they shared
2. Gently helping them connect to their emotional experience
3. Asking what feelings or emotions they're experiencing about the situation
4. Offering a few emotion words as examples if they seem stuck (e.g., "Are you feeling frustrated, anxious, sad, or something else?")

Example: If they say "I had a bad day at work", you might respond: "I hear that you had a difficult day. That sounds challenging. What emotions are coming up for you when you think about what happened? Are you feeling frustrated, disappointed, anxious, or maybe something else entirely?"

When You've Reached the Root Cause:
After 3-5 thoughtful exchanges, when you identify a fundamental belief, unmet need, or core pattern, provide a synthesis that includes:

1. A clear statement starting with "ROOT CAUSE IDENTIFIED:"
2. A 2-3 sentence summary of the root cause
3. A brief list of key themes that emerged (mark with "KEY THEMES:")
4. A compassionate closing reflection

Example of Completion Format:
"ROOT CAUSE IDENTIFIED: It seems the anxiety about work stems from a deep-seated belief that your worth is tied to your productivity and achievements. When you're not excelling, you feel like you're failing as a person, which triggers intense fear of rejection.

KEY THEMES: Performance-based self-worth, fear of rejection, perfectionism, validation-seeking

This is a profound realization. Many people carry this belief without realizing it. Recognizing it is the first step toward building a healthier relationship with yourself and your work."

Important:
- Never rush to conclusions
- Don't offer solutions or advice unless asked
- Focus on discovery, not therapy
- Be warm but maintain professional boundaries
- If the user becomes distressed, offer compassion and suggest professional support if needed`;
  }

  private detectSessionCompletion(response: string, turnCount: number): boolean {
    // Check for explicit root cause identification
    if (response.includes('ROOT CAUSE IDENTIFIED:')) {
      return true;
    }

    // If we've exceeded 5 turns and Claude is summarizing, consider it complete
    if (turnCount >= 5 && (
      response.toLowerCase().includes('it seems') ||
      response.toLowerCase().includes('it appears that') ||
      response.toLowerCase().includes('the core issue')
    )) {
      return true;
    }

    return false;
  }

  private extractRootCauseAnalysis(response: string): {
    rootCause?: string;
    themes?: string[];
  } {
    const rootCauseMatch = response.match(/ROOT CAUSE IDENTIFIED:(.+?)(?=KEY THEMES:|$)/s);
    const themesMatch = response.match(/KEY THEMES:(.+?)(?=\n\n|$)/s);

    const rootCause = rootCauseMatch ? rootCauseMatch[1].trim() : undefined;
    const themesText = themesMatch ? themesMatch[1].trim() : undefined;
    const themes = themesText
      ? themesText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
      : undefined;

    return { rootCause, themes };
  }
}

export const claudeService = new ClaudeService();
