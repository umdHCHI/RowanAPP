import { useEffect, useCallback, useMemo } from "react";
import { useStoryStore } from "@/stores/story-store";
import type {
  UseStoryHistoryResult,
  UseStoryHistoryProps,
} from "@/types/hooks";

const storyDebug = (..._args: unknown[]) => {};

export function useStoryHistory({
  currentPassage,
}: UseStoryHistoryProps): UseStoryHistoryResult {
  const activeStoryId = useStoryStore((state) => state.storyId);
  const engineState = useStoryStore((state) => state.engineState);
  const history = useStoryStore((state) => state.history);
  const addPassageToHistory = useStoryStore(
    (state) => state.addPassageToHistory,
  );
  const addChoiceToHistory = useStoryStore((state) => state.addChoiceToHistory);
  const addRewardToHistory = useStoryStore((state) => state.addRewardToHistory);

  const scopedHistory = useMemo(() => {
    if (activeStoryId == null) return [];
    const activeId = String(activeStoryId);
    return history.filter(
      (item) => item.storyId != null && String(item.storyId) === activeId,
    );
  }, [history, activeStoryId]);

  // Add current passage to history when it changes
  useEffect(() => {
    const engineStoryId = (engineState as any)?.story?.id;
    const activeId = activeStoryId != null ? String(activeStoryId) : null;
    const engineId = engineStoryId != null ? String(engineStoryId) : null;
    if (activeId != null && engineId != null && activeId !== engineId) {
      storyDebug("skip-add-passage-mismatched-story", {
        activeStoryId: activeId,
        engineStoryId: engineId,
        passageId: currentPassage?.passage_id ?? null,
      });
      return;
    }

    if (currentPassage && currentPassage.content) {
      storyDebug("add-passage", {
        activeStoryId: activeId,
        engineStoryId: engineId,
        passageId: currentPassage.passage_id,
      });
      addPassageToHistory(currentPassage);
    }
  }, [
    activeStoryId,
    engineState,
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

  return { history: scopedHistory, addChoice, addReward };
}
