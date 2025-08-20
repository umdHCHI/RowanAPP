import { extractPromptText, getDisplayPrompt, sanitizeCodexEntry } from '../codexUtils';

describe('codexUtils', () => {
  describe('extractPromptText', () => {
    it('should return string prompts as-is', () => {
      expect(extractPromptText('Write about your day')).toBe('Write about your day');
      expect(extractPromptText('Reflect on stress')).toBe('Reflect on stress');
    });

    it('should extract text from object prompts', () => {
      expect(extractPromptText({ text: 'Write about your day' })).toBe('Write about your day');
      expect(extractPromptText({ text: 'Reflect on stress' })).toBe('Reflect on stress');
    });

    it('should return fallback for null/undefined prompts', () => {
      expect(extractPromptText(null)).toBe('<Untitled Prompt>');
      expect(extractPromptText(undefined)).toBe('<Untitled Prompt>');
    });

    it('should return fallback for objects without text property', () => {
      expect(extractPromptText({})).toBe('<Untitled Prompt>');
      expect(extractPromptText({ id: 1 })).toBe('<Untitled Prompt>');
    });

    it('should return fallback for non-string text properties', () => {
      expect(extractPromptText({ text: null })).toBe('<Untitled Prompt>');
      expect(extractPromptText({ text: undefined })).toBe('<Untitled Prompt>');
      expect(extractPromptText({ text: 123 })).toBe('<Untitled Prompt>');
    });
  });

  describe('getDisplayPrompt', () => {
    it('should return the same result as extractPromptText', () => {
      expect(getDisplayPrompt('Write about your day')).toBe(extractPromptText('Write about your day'));
      expect(getDisplayPrompt({ text: 'Reflect on stress' })).toBe(extractPromptText({ text: 'Reflect on stress' }));
      expect(getDisplayPrompt(null)).toBe(extractPromptText(null));
    });
  });

  describe('sanitizeCodexEntry', () => {
    it('should sanitize a complete codex entry', () => {
      const entry = {
        id: 123,
        prompt: { text: 'Write about your day' },
        content: 'Today was great!',
        entry_type: 'journal',
        timestamp: 1234567890,
        type: 'journal',
        passages: 'Some passages',
        skillCategory: 'Self-Compassion',
        mapArea: 'garden',
        difficulty: 'Beginner'
      };

      const sanitized = sanitizeCodexEntry(entry);

      expect(sanitized).toEqual({
        id: '123',
        prompt: 'Write about your day',
        content: 'Today was great!',
        entry_type: 'journal',
        timestamp: 1234567890,
        type: 'journal',
        passages: 'Some passages',
        skillCategory: 'Self-Compassion',
        mapArea: 'garden',
        difficulty: 'Beginner'
      });
    });

    it('should provide safe defaults for missing fields', () => {
      const entry = {
        id: null,
        prompt: null,
        content: null,
        entry_type: null,
        timestamp: null,
        type: null,
        passages: null,
        skillCategory: null,
        mapArea: null,
        difficulty: null
      };

      const sanitized = sanitizeCodexEntry(entry);

      expect(sanitized).toEqual({
        id: '',
        prompt: '<Untitled Prompt>',
        content: '',
        entry_type: 'journal',
        timestamp: expect.any(Number),
        type: 'journal',
        passages: '',
        skillCategory: 'General',
        mapArea: 'entrance',
        difficulty: 'easy'
      });
    });
  });
});
