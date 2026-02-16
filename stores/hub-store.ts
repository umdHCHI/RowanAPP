import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HUB_STORAGE_KEY = "the-archive-hub-storage";

interface HubState {
  activeIndex: number;
  scrollOffsetX: number;
  pendingRestore: boolean;
  lastUserId: number | null;
  setActiveIndex: (index: number) => void;
  setScrollOffsetX: (offset: number) => void;
  setPendingRestore: (pending: boolean) => void;
  setLastUserId: (userId: number | null) => void;
}

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      activeIndex: 0,
      scrollOffsetX: 0,
      pendingRestore: true,
      lastUserId: null,
      setActiveIndex: (index) => set({ activeIndex: index }),
      setScrollOffsetX: (offset) => set({ scrollOffsetX: offset }),
      setPendingRestore: (pending) => set({ pendingRestore: pending }),
      setLastUserId: (userId) => set({ lastUserId: userId }),
    }),
    {
      name: HUB_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeIndex: state.activeIndex,
        scrollOffsetX: state.scrollOffsetX,
        lastUserId: state.lastUserId,
      }),
    },
  ),
);
