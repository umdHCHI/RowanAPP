import { useEffect, useCallback } from "react";
import { useStoryStore } from "@/stores/story-store";
import type {
  UseStoryHistoryResult,
  UseStoryHistoryProps,
} from "@/types/hooks";

export function useStoryHistory({
  currentPassage,
}: UseStoryHistoryProps): UseStoryHistoryResult {
  const history = useStoryStore((state) => state.history);
  const addPassageToHistory = useStoryStore(
    (state) => state.addPassageToHistory,
  );
  const addChoiceToHistory = useStoryStore((state) => state.addChoiceToHistory);
  const addRewardToHistory = useStoryStore((state) => state.addRewardToHistory);

  // Add current passage to history when it changes
  useEffect(() => {
    if (currentPassage && currentPassage.content) {
      addPassageToHistory(currentPassage);
    }
  }, [
    currentPassage,
    currentPassage?.passage_id,
    currentPassage?.content,
    currentPassage?.passage_type,
    currentPassage?.speaker_name,
    currentPassage?.speaker_image,
    addPassageToHistory,
  ]);

  const addChoice = useCallback(
    (choice: { id: number | string; text: string }) => {
      addChoiceToHistory(choice);
    },
    [addChoiceToHistory],
  );

  const addReward = useCallback(
    (reward: {
      id: string;
      type:
        | "journal_entry"
        | "minigame"
        | "power"
        | "skill"
        | "gear"
        | "lumens";
      title: string;
      subtitle?: string;
      journalEntryId?: string;
      minigameLevel?: string;
      minigameIsTutorial?: boolean;
      lumensAmount?: number;
    }) => {
      addRewardToHistory(reward);
    },
    [addRewardToHistory],
  );

  return { history, addChoice, addReward };
}
