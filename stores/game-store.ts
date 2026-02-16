import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import type { NotificationTime } from "@/types/hooks";

// Lumens
export const LumenLevelSchema = z.object({
  lumens: z.number().default(0),
});

export type LumenLevel = z.infer<typeof LumenLevelSchema>;

// Story progression
export interface StoryState {
  currentChapter: number;
  voidClarity: number; // 0-100, represents how clear the void/library becomes
  visitedLocations: string[];
  completedChoices: Record<string, string>;
}

// Journal progression
export interface JournalState {
  currentJournal: number;
  voidClarity: number; // 0-100, represents how clear the void/library becomes
  visitedLocations: string[];
  completedChoices: Record<string, string>;
}

// Journal Prompt from API
export interface JournalPrompt {
  id: number;
  prompt_id: string;
  text: string;
  category: string;
  skill_category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  is_active: boolean;
  order: number;
  required_story_id: number | null;
  required_passage_id: number | null;
  personality_traits: string[];
  unlocked: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Story data from API (aligns with StoryResponse; optional fields match backend)
export interface StoryData {
  id: number;
  title: string;
  description: string;
  image: string | null;
  starting_passage_id: string;
  estimated_time_minutes: number;
  is_repeatable: boolean;
  created_at: string;
  updated_at: string;
  is_hidden?: boolean;
  passage_count?: number;
  total_passages?: number;
  min_level?: number;
  category?: string;
  rarity?: string;
  story_themes?: string[];
  revelations?: string[];
  atmosphere?: string;
  difficulty?: string;
  personality_focus?: string[];
}

export type TextSpeed = "slow" | "normal" | "fast";

// Memory item
export interface Memory {
  id: string;
  title: string;
  description?: string;
  type: string;
  modality?: "journal" | "draw" | "voice" | "journal_reward";
  content?: string; // JSON string for drawings, text for write, URI for voice
  createdAt?: string;
}

// Power item
export interface Power {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  isActive?: boolean;
  icon?: string;
}

interface GameState {
  // Lumens
  lumens: LumenLevel;

  // Story
  story: StoryState;

  // Journal
  journal: JournalState;
  journalPrompts: JournalPrompt[];

  // Memories
  memories: Memory[];

  // Stories from API
  stories: StoryData[];
  isLoadingStories: boolean;

  // Journal reward tracking
  collectedJournalRewardIds: string[];

  // Powers
  powers: Power[];
  lastSeenPowerUnlockAt?: string;

  // Settings
  soundMuted: boolean;
  textSpeed: TextSpeed;
  notificationsEnabled: boolean;
  notificationTime: NotificationTime;

  // Actions
  updateLumen: (lumen: keyof LumenLevel, value: number) => void;
  progressStory: (chapter: number, clarity?: number) => void;
  progressJournal: (journalIndex: number, clarity?: number) => void;
  makeChoice: (
    choiceId: string,
    choice: string,
    lumenChanges?: Partial<LumenLevel>,
  ) => void;
  setJournalPrompts: (prompts: JournalPrompt[]) => void;
  setStories: (stories: StoryData[]) => void;
  setLoadingStories: (loading: boolean) => void;
  addMemory: (memory: Memory) => void;
  markJournalRewardCollected: (id: string) => void;
  hasCollectedJournalReward: (id: string) => boolean;
  setPowers: (powers: Power[]) => void;
  unlockPower: (power: Power) => void;
  setActivePower: (powerId: string) => void;
  markPowersSeen: () => void;
  toggleSoundMute: () => void;
  setTextSpeed: (speed: TextSpeed) => void;
  cycleTextSpeed: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: NotificationTime) => void;
  setLumen: (lumen: LumenLevel) => void;
  resetGame: () => void;
}

const defaultLumen: LumenLevel = {
  lumens: 0,
};

const defaultStory: StoryState = {
  currentChapter: 0,
  voidClarity: 0,
  visitedLocations: [],
  completedChoices: {},
};

const defaultJournal: JournalState = {
  currentJournal: 0,
  voidClarity: 0,
  visitedLocations: [],
  completedChoices: {},
};

const textSpeedOrder: TextSpeed[] = ["slow", "normal", "fast"];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      lumens: defaultLumen,
      story: defaultStory,
      journal: defaultJournal,
      journalPrompts: [],
      memories: [],
      stories: [],
      isLoadingStories: false,
      collectedJournalRewardIds: [],
      powers: [],
      lastSeenPowerUnlockAt: undefined,
      soundMuted: false,
      textSpeed: "normal",
      notificationsEnabled: true,
      notificationTime: { hour: 9, minute: 0 },

      updateLumen: (lumen, delta) =>
        set((state) => {
          const currentValue = state.lumens[lumen];
          const newValue = Math.max(1, Math.min(5, currentValue + delta));
          return {
            lumens: {
              ...state.lumens,
              [lumen]: newValue,
            },
          };
        }),

      progressStory: (chapter, clarity) =>
        set((state) => ({
          story: {
            ...state.story,
            currentChapter: chapter,
            voidClarity: clarity ?? state.story.voidClarity,
          },
        })),

      progressJournal: (journalIndex, clarity) =>
        set((state) => ({
          journal: {
            ...state.journal,
            currentJournal: journalIndex,
            voidClarity: clarity ?? state.journal.voidClarity,
          },
        })),

      makeChoice: (choiceId, choice, lumenChanges) =>
        set((state) => {
          const newLumens = lumenChanges
            ? Object.entries(lumenChanges).reduce(
                (acc, [key, value]) => {
                  const lumenKey = key as keyof LumenLevel;
                  const currentValue = state.lumens[lumenKey];
                  return {
                    ...acc,
                    [lumenKey]: Math.max(
                      1,
                      Math.min(5, currentValue + (value ?? 0)),
                    ),
                  };
                },
                { ...state.lumens },
              )
            : state.lumens;

          return {
            lumens: newLumens,
            story: {
              ...state.story,
              completedChoices: {
                ...state.story.completedChoices,
                [choiceId]: choice,
              },
            },
          };
        }),

      setJournalPrompts: (prompts) => set({ journalPrompts: prompts }),

      setStories: (stories) => set({ stories }),

      setLoadingStories: (loading) => set({ isLoadingStories: loading }),

      addMemory: (memory) =>
        set((state) => ({
          memories: [...state.memories, memory],
        })),

      markJournalRewardCollected: (id) =>
        set((state) => {
          if (state.collectedJournalRewardIds.includes(id)) {
            return state;
          }
          return {
            collectedJournalRewardIds: [...state.collectedJournalRewardIds, id],
          };
        }),

      hasCollectedJournalReward: (id: string) => {
        const state = get();
        return state.collectedJournalRewardIds.includes(id);
      },

      setPowers: (powers) => set({ powers }),

      unlockPower: (power) =>
        set((state) => {
          const existingIndex = state.powers.findIndex(
            (p) => p.id === power.id,
          );
          const now = new Date().toISOString();
          const updatedPower: Power = {
            ...power,
            isUnlocked: true,
            unlockedAt: power.unlockedAt || now,
          };

          if (existingIndex >= 0) {
            const updatedPowers = [...state.powers];
            updatedPowers[existingIndex] = updatedPower;
            return { powers: updatedPowers };
          } else {
            return { powers: [...state.powers, updatedPower] };
          }
        }),
      // TODO: Hook power unlocks into story effects parsing
      // When story effects include a power unlock (e.g., effects.power or effects.unlock_power),
      // call: useGameStore.getState().unlockPower({ id, title, description, icon })
      // See: components/story/StoryPage.tsx collectJournalReward() for similar pattern

      setActivePower: (powerId) =>
        set((state) => ({
          powers: state.powers.map((power) => ({
            ...power,
            isActive: power.id === powerId ? true : false,
          })),
        })),

      markPowersSeen: () =>
        set({ lastSeenPowerUnlockAt: new Date().toISOString() }),

      toggleSoundMute: () =>
        set((state) => ({ soundMuted: !state.soundMuted })),

      setTextSpeed: (speed) => set({ textSpeed: speed }),

      cycleTextSpeed: () =>
        set((state) => {
          const currentIndex = textSpeedOrder.indexOf(state.textSpeed);
          const nextSpeed =
            textSpeedOrder[(currentIndex + 1) % textSpeedOrder.length];
          return { textSpeed: nextSpeed };
        }),

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      setNotificationTime: (time) => set({ notificationTime: time }),

      setLumen: (lumen: LumenLevel) => set({ lumens: lumen }),

      resetGame: () =>
        set({
          lumens: defaultLumen,
          story: defaultStory,
          journal: defaultJournal,
          journalPrompts: [],
          memories: [],
          stories: [],
          isLoadingStories: false,
          collectedJournalRewardIds: [],
          powers: [],
          lastSeenPowerUnlockAt: undefined,
          soundMuted: false,
          textSpeed: "normal",
          notificationsEnabled: true,
          notificationTime: { hour: 9, minute: 0 },
        }),
    }),
    {
      name: "the-archive-game-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
