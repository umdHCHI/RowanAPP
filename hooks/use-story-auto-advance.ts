import { useEffect, useCallback } from 'react'
import type { StoryPassage, StoryChoice } from '@/types/story'
import { AUTO_ADVANCE_SPEED, isContinueChoice } from '@/utils/story-constants'
import type { TextSpeed } from '@/stores/game-store'

interface UseStoryAutoAdvanceProps {
  hasChoices: boolean
  isLoading: boolean
  currentPassage: StoryPassage | null
  choices: StoryChoice[]
  textSpeed: TextSpeed
  isPaused: boolean
  onAutoAdvance: (choice: StoryChoice) => void
}

/**
 * Hook to handle auto-advancing "Continue" choices
 */
export function useStoryAutoAdvance({
  hasChoices,
  isLoading,
  currentPassage,
  choices,
  textSpeed,
  isPaused,
  onAutoAdvance,
}: UseStoryAutoAdvanceProps) {
  useEffect(() => {
    if (hasChoices && !isLoading && currentPassage && !isPaused) {
      const continueChoice = choices.find((choice) => isContinueChoice(choice.text))

      if (continueChoice) {
        const contentLength = currentPassage.content?.length || 0
        // Estimate word count: average English word is ~5 characters (including space)
        const estimatedWordCount = Math.max(1, Math.ceil(contentLength / 5))
        const { wordDelay, minDelay, maxDelay } = AUTO_ADVANCE_SPEED[textSpeed]
        // Calculate delay based on word count, then clamp between min and max
        const delay = Math.min(Math.max(estimatedWordCount * wordDelay, minDelay), maxDelay)

        const timer = setTimeout(() => {
          onAutoAdvance(continueChoice)
        }, delay)

        return () => clearTimeout(timer)
      }
    }
  }, [hasChoices, choices, isLoading, currentPassage, onAutoAdvance, textSpeed, isPaused])
}

