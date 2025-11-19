/**
 * Count the number of words in a text string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Minimum word count required for AI analysis
 */
export const MIN_WORDS_FOR_ANALYSIS = 50;

/**
 * Check if content has enough words for meaningful AI analysis
 */
export function hasEnoughContentForAnalysis(text: string): boolean {
  return countWords(text) >= MIN_WORDS_FOR_ANALYSIS;
}

/**
 * Get a validation message if content is insufficient
 */
export function getContentValidationMessage(text: string): string | null {
  const wordCount = countWords(text);
  if (wordCount < MIN_WORDS_FOR_ANALYSIS) {
    return `Your entry has ${wordCount} word${wordCount !== 1 ? 's' : ''}. AI analysis requires at least ${MIN_WORDS_FOR_ANALYSIS} words to provide meaningful insights.`;
  }
  return null;
}
