import type { TextSpeed } from '@/stores/game-store'

/**
 * Auto-advance speed configuration for story text
 */
export const AUTO_ADVANCE_SPEED: Record<
  TextSpeed,
  { charDelay: number; minDelay: number; maxDelay: number }
> = {
  slow: { charDelay: 140, minDelay: 4000, maxDelay: 10000 },
  normal: { charDelay: 100, minDelay: 3000, maxDelay: 8000 },
  fast: { charDelay: 65, minDelay: 1500, maxDelay: 5000 },
}

/**
 * Introduction story ID
 */
export const INTRODUCTION_STORY_ID = 12

/**
 * Check if a choice text is a "Continue" choice
 */
export function isContinueChoice(choiceText: string): boolean {
  return choiceText.toLowerCase().includes('continue')
}

