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
      const exists = state.history.some(
        (item) =>
          item.storyId != null &&
          String(item.storyId) === String(activeStoryId) &&
          item.id === passage.passage_id &&
          item.type === "passage",
      );
      if (exists) return state;
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
