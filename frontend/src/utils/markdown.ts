/**
 * Removes markdown formatting from text to make it more conversational
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Remove headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove bullet points and list markers
    .replace(/^\s*[-•*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Formats text for display in chat interface
 */
export function formatChatMessage(text: string): string {
  // Strip markdown but preserve paragraph breaks
  const stripped = stripMarkdown(text);
  
  // Ensure proper spacing between paragraphs
  return stripped
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .join('\n\n');
}
