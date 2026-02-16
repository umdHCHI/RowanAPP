import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORY_COMPLETION_STORAGE_KEY = "the-archive-story-completions";

interface StoryCompletionState {
  completedStoryIds: number[];
  markStoryCompleted: (storyId: number) => void;
  clearStoryCompleted: (storyId: number) => void;
  isStoryCompleted: (storyId: number) => boolean;
}

export const useStoryCompletionStore = create<StoryCompletionState>()(
  persist(
    (set, get) => ({
      completedStoryIds: [],
      markStoryCompleted: (storyId) =>
        set((state) => {
          if (state.completedStoryIds.includes(storyId)) return state;
          return { completedStoryIds: [...state.completedStoryIds, storyId] };
        }),
      clearStoryCompleted: (storyId) =>
        set((state) => ({
          completedStoryIds: state.completedStoryIds.filter(
            (id) => id !== storyId,
          ),
        })),
      isStoryCompleted: (storyId) => get().completedStoryIds.includes(storyId),
    }),
    {
      name: STORY_COMPLETION_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
