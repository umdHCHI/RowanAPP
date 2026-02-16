import { useEffect } from "react";
import {
  AUTO_ADVANCE_SPEED,
  isExactContinueChoice,
} from "@/utils/story-constants";
import type { UseStoryAutoAdvanceProps } from "@/types/hooks";

/**
 * Hook to handle auto-advancing. Only single choices with text exactly "Continue" / "continue" auto-advance.
 * Does NOT auto-advance on journal_entry or mini_game passage types (they require user tap).
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
      // Don't auto-advance on journal_entry or mini_game passages (they're tappable cards)
      const passageType = currentPassage.passage_type;
      if (passageType === "journal_entry" || passageType === "mini_game") {
        return;
      }

      const singleChoice = choices.length === 1 ? choices[0] : null;
      const autoChoice = singleChoice;
      const targetId = autoChoice?.target_id?.trim() ?? "";
      const hasValidTarget = targetId.length > 0 && targetId !== "minigame";
      const isContinueOnly = autoChoice
        ? isExactContinueChoice(autoChoice.text ?? "")
        : false;

      if (autoChoice && hasValidTarget && isContinueOnly) {
        const contentLength = currentPassage.content?.length || 0;
        // Estimate word count: average English word is ~5 characters (including space)
        const estimatedWordCount = Math.max(1, Math.ceil(contentLength / 5));
        const { wordDelay, minDelay, maxDelay } = AUTO_ADVANCE_SPEED[textSpeed];
        // Calculate delay based on word count, then clamp between min and max
        const delay = Math.min(
          Math.max(estimatedWordCount * wordDelay, minDelay),
          maxDelay,
        );

        const timer = setTimeout(() => {
          onAutoAdvance(autoChoice);
        }, delay);

        return () => clearTimeout(timer);
      }
    }
  }, [
    hasChoices,
    choices,
    isLoading,
    currentPassage,
    onAutoAdvance,
    textSpeed,
    isPaused,
  ]);
}
