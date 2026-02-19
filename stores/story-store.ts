import { create } from "zustand";
import type { EngineState } from "@/types/hooks";
import type { EmaRequestPayload } from "@/types/ema";
import type {
  StoryChoice,
  StoryHistoryItem,
  StoryPassage,
} from "@/types/story";
import { isContinueChoice } from "@/utils/story-constants";

interface StorySessionState {
  storyId: number | string | null;
  engineState: EngineState | null;
  isLoading: boolean;
  error: string | null;
  isPaused: boolean;
  storyTitle: string | null;
  currentPassage: StoryPassage | null;
  choices: StoryChoice[];
  isInitialized: boolean;
  isEnding: boolean;
  isDecision: boolean;
  hasChoices: boolean;
  hasMultipleChoices: boolean;
  pendingEmaRequest: EmaRequestPayload | null;
  history: StoryHistoryItem[];
  setStoryId: (storyId: number | string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPaused: (next: boolean | ((prev: boolean) => boolean)) => void;
  setEngineState: (engineState: EngineState | null) => void;
  resetStoryState: () => void;
  addPassageToHistory: (passage: StoryPassage) => void;
  addChoiceToHistory: (choice: { id: number | string; text: string }) => void;
  addRewardToHistory: (reward: {
    id: string;
    type: "journal_entry" | "minigame" | "power" | "skill" | "gear" | "lumens";
    title: string;
    subtitle?: string;
    journalEntryId?: string;
    minigameLevel?: string;
    minigameIsTutorial?: boolean;
    lumensAmount?: number;
  }) => void;
  clearHistory: () => void;
}

const emptyDerivedState = {
  storyTitle: null,
  currentPassage: null,
  choices: [] as StoryChoice[],
  isInitialized: false,
  isEnding: false,
  isDecision: false,
  hasChoices: false,
  hasMultipleChoices: false,
  pendingEmaRequest: null as EmaRequestPayload | null,
};

function deriveState(engineState: EngineState | null) {
  if (!engineState) return emptyDerivedState;
  const currentPassage = engineState.passage ?? null;
  const choices = currentPassage?.choices ?? [];
  const isDecision = currentPassage?.passage_type === "decision";
  const isEnding = currentPassage?.passage_type === "ending";
  const hasChoices = choices.length > 0;
  const hasMultipleChoices = choices.length > 1;
  return {
    storyTitle: engineState?.story?.title ?? null,
    currentPassage,
    choices,
    isInitialized: true,
    isEnding,
    isDecision,
    hasChoices,
    hasMultipleChoices,
    pendingEmaRequest: engineState?.emaRequest ?? null,
  };
}

export const useStoryStore = create<StorySessionState>()((set, get) => ({
  storyId: null,
  engineState: null,
  isLoading: false,
  error: null,
  isPaused: false,
  ...emptyDerivedState,
  history: [],
  setStoryId: (storyId) => set({ storyId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPaused: (next) =>
    set((state) => ({
      isPaused: typeof next === "function" ? next(state.isPaused) : next,
    })),
  setEngineState: (engineState) =>
    set({ engineState, ...deriveState(engineState) }),
  resetStoryState: () =>
    set({
      storyId: null,
      engineState: null,
      isLoading: false,
      error: null,
      isPaused: false,
      history: [],
      ...emptyDerivedState,
    }),
  addPassageToHistory: (passage) => {
    if (!passage?.content) return;
    set((state) => {
      const activeStoryId = state.storyId;
      if (activeStoryId == null) return state;

      // Check if this passage already exists in history for this story
      const alreadyInHistory = state.history.some(
        (item) =>
          item.storyId != null &&
          String(item.storyId) === String(activeStoryId) &&
          item.id === passage.passage_id &&
          item.type === "passage",
      );

      // If passage is already in history, check if we need to clean up forward history.
      // This handles the case where user navigates backward in the story (e.g., to a
      // decision point they've visited before) and then replays a different path.
      if (alreadyInHistory) {
        // Find where this passage appears in history
        const passageIndex = state.history.findIndex(
          (item) =>
            item.storyId != null &&
            String(item.storyId) === String(activeStoryId) &&
            item.id === passage.passage_id &&
            item.type === "passage",
        );

        // Look for recently added choices after this passage
        // (choices added in this call chain before the passage was re-encountered)
        let hasRecentChoices = false;
        for (let i = passageIndex + 1; i < state.history.length; i++) {
          if (state.history[i].type === "choice") {
            hasRecentChoices = true;
            break;
          }
        }

        // If there are choices after this passage in history, preserve them
        // (they represent the user's new navigation path from this passage).
        // Otherwise, trim history at this passage to prevent showing old forward paths.
        if (!hasRecentChoices) {
          // No new choices after passage - clear forward history to reset narrative
          return { history: state.history.slice(0, passageIndex + 1) };
        }
        // Has recent choices - preserve them, don't add passage again
        return state;
      }

      // Passage doesn't exist in history - add it normally
      return {
        history: [
          ...state.history,
          {
            storyId: activeStoryId,
            type: "passage",
            content: passage.content,
            id: passage.passage_id,
            passageType: passage.passage_type,
            speakerName: passage.speaker_name,
            speakerImage: passage.speaker_image,
            minigameIsTutorial:
              passage.passage_type === "mini_game"
                ? (passage.story_effects?.minigame_tutorial as unknown) ===
                    true ||
                  (passage.story_effects?.minigame_tutorial as unknown) === 1 ||
                  (passage.story_effects?.minigame_tutorial as unknown) ===
                    "1" ||
                  (passage.story_effects?.minigame_tutorial as unknown) ===
                    "true" ||
                  (passage.effects?.minigame_tutorial as unknown) === true ||
                  (passage.effects?.minigame_tutorial as unknown) === 1 ||
                  (passage.effects?.minigame_tutorial as unknown) === "1" ||
                  (passage.effects?.minigame_tutorial as unknown) === "true"
                : undefined,
          },
        ],
      };
    });
  },
  addChoiceToHistory: (choice) => {
    if (isContinueChoice(choice.text)) return;
    set((state) => ({
      history:
        state.storyId == null
          ? state.history
          : [
              ...state.history,
              {
                storyId: state.storyId,
                type: "choice",
                content: choice.text,
                id: String(choice.id),
              },
            ],
    }));
  },
  addRewardToHistory: (reward) => {
    set((state) => ({
      history:
        state.storyId == null
          ? state.history
          : [
              ...state.history,
              {
                storyId: state.storyId,
                type: "reward",
                content: reward.title,
                id: reward.id,
                rewardType: reward.type,
                rewardTitle: reward.title,
                rewardSubtitle: reward.subtitle,
                journalEntryId: reward.journalEntryId,
                minigameLevel: reward.minigameLevel,
                minigameIsTutorial: reward.minigameIsTutorial,
                lumensAmount: reward.lumensAmount,
              },
            ],
    }));
  },
  clearHistory: () => set({ history: [] }),
}));
