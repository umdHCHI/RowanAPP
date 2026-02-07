import { useEffect } from 'react'
import { AUTO_ADVANCE_SPEED } from '@/utils/story-constants'
import type { UseStoryAutoAdvanceProps } from '@/types/hooks'

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
      const singleChoice = choices.length === 1 ? choices[0] : null
      const autoChoice = singleChoice
      const targetId = autoChoice?.target_id?.trim() ?? ''
      const hasValidTarget = targetId.length > 0 && targetId !== 'minigame'

      if (autoChoice && hasValidTarget) {
        const contentLength = currentPassage.content?.length || 0
        // Estimate word count: average English word is ~5 characters (including space)
        const estimatedWordCount = Math.max(1, Math.ceil(contentLength / 5))
        const { wordDelay, minDelay, maxDelay } = AUTO_ADVANCE_SPEED[textSpeed]
        // Calculate delay based on word count, then clamp between min and max
        const delay = Math.min(Math.max(estimatedWordCount * wordDelay, minDelay), maxDelay)

        const timer = setTimeout(() => {
          onAutoAdvance(autoChoice)
        }, delay)

        return () => clearTimeout(timer)
      }
    }
  }, [hasChoices, choices, isLoading, currentPassage, onAutoAdvance, textSpeed, isPaused])
}
