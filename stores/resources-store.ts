import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ResourcesTabType } from "@/types/resources/resources";

const RESOURCES_STORAGE_KEY = "the-archive-resources-storage";

interface ResourcesState {
  activeTab: ResourcesTabType;
  scrollOffsetX: number;
  pendingRestore: boolean;
  setActiveTab: (tab: ResourcesTabType) => void;
  setScrollOffsetX: (offset: number) => void;
  setPendingRestore: (pending: boolean) => void;
}

export const useResourcesStore = create<ResourcesState>()(
  persist(
    (set) => ({
      activeTab: "resources",
      scrollOffsetX: 0,
      pendingRestore: true,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setScrollOffsetX: (offset) => set({ scrollOffsetX: offset }),
      setPendingRestore: (pending) => set({ pendingRestore: pending }),
    }),
    {
      name: RESOURCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        scrollOffsetX: state.scrollOffsetX,
      }),
    }
  )
);
