import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReflectionMode, Stroke } from "@/types/journal/journal";

const JOURNAL_STORAGE_KEY = "the-archive-journal-drafts";

export interface JournalDraft {
  text: string;
  drawing: Stroke[];
  audioUri: string | null;
  audioDurationSeconds: number | null;
  audioMimeType: string | null;
  audioFileName: string | null;
}

interface JournalDraftState {
  mode: ReflectionMode;
  currentPromptIndex: number;
  drafts: Record<string, JournalDraft>;
  setMode: (mode: ReflectionMode) => void;
  setCurrentPromptIndex: (index: number) => void;
  upsertDraft: (key: string, partial: Partial<JournalDraft>) => void;
  setDraft: (key: string, draft: JournalDraft) => void;
  clearDraft: (key: string) => void;
}

const emptyDraft: JournalDraft = {
  text: "",
  drawing: [],
  audioUri: null,
  audioDurationSeconds: null,
  audioMimeType: null,
  audioFileName: null,
};

export const useJournalDraftStore = create<JournalDraftState>()(
  persist(
    (set, get) => ({
      mode: "journal",
      currentPromptIndex: 0,
      drafts: {},
      setMode: (mode) => set({ mode }),
      setCurrentPromptIndex: (index) => set({ currentPromptIndex: index }),
      upsertDraft: (key, partial) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: {
              ...emptyDraft,
              ...state.drafts[key],
              ...partial,
            },
          },
        })),
      setDraft: (key, draft) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: { ...emptyDraft, ...draft },
          },
        })),
      clearDraft: (key) => {
        const { drafts } = get();
        if (!drafts[key]) return;
        const nextDrafts = { ...drafts };
        delete nextDrafts[key];
        set({ drafts: nextDrafts });
      },
    }),
    {
      name: JOURNAL_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mode: state.mode,
        currentPromptIndex: state.currentPromptIndex,
        drafts: state.drafts,
      }),
    }
  )
);
