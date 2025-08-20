/**
 * Utility functions for handling codex entries and prompts
 * 
 * These functions provide null-safe handling of codex entry prompts
 * to prevent display issues when prompt data is missing or malformed.
 */

/**
 * Safely extract prompt text from various prompt formats
 * 
 * This function handles the case where entry.prompt could be:
 * - A string (direct prompt text)
 * - An object with a text property (nested prompt structure)
 * - null or undefined (missing prompt data)
 * 
 * @param prompt - The prompt which could be string, object with text property, or null/undefined
 * @returns The prompt text or fallback message '<Untitled Prompt>'
 * 
 * @example
 * extractPromptText("Write about your day") // Returns "Write about your day"
 * extractPromptText({ text: "Reflect on stress" }) // Returns "Reflect on stress"
 * extractPromptText(null) // Returns "<Untitled Prompt>"
 * extractPromptText(undefined) // Returns "<Untitled Prompt>"
 */
export const extractPromptText = (prompt: any): string => {
  if (typeof prompt === 'string') {
    return prompt;
  }
  if (prompt && typeof prompt === 'object' && prompt.text) {
    return prompt.text;
  }
  return '<Untitled Prompt>';
};

/**
 * Safely get a display-friendly prompt text for UI components
 * @param prompt - The prompt which could be string, object with text property, or null/undefined
 * @returns The prompt text or fallback message
 */
export const getDisplayPrompt = (prompt: any): string => {
  return extractPromptText(prompt);
};

/**
 * Validate and sanitize a codex entry for display
 * @param entry - The codex entry to validate
 * @returns A sanitized entry with safe defaults
 */
export const sanitizeCodexEntry = (entry: any) => {
  return {
    id: entry.id?.toString() || '',
    prompt: getDisplayPrompt(entry.prompt),
    content: entry.content || '',
    entry_type: entry.entry_type || 'journal',
    timestamp: entry.timestamp || Date.now(),
    type: entry.type || 'journal',
    passages: entry.passages || entry.content || '',
    skillCategory: entry.skillCategory || 'General',
    mapArea: entry.mapArea || 'entrance',
    difficulty: entry.difficulty || 'easy'
  };
};
