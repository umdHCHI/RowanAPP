import { useMemo } from "react";
import { useHubStories } from "../hub/use-hub-stories";
import { mapStoriesToCards } from "@/utils/story-mapper";
import { useCurrentUserFullProfile, useStoryProgress } from "@/api";
import type { UseStoryCardsResult } from "@/types/hooks";
import { useStoryCompletionStore } from "@/stores/story-completion-store";

/**
 * Get story cards with transformation logic.
 * Uses a single bulk progress request instead of N per-story requests for faster hub load.
 */
export function useStoryCards(): UseStoryCardsResult {
  const {
    data: stories,
    isLoading: isLoadingStories,
    error: storiesError,
  } = useHubStories();
  const { data: userProfile, isLoading: isLoadingProfile } =
    useCurrentUserFullProfile();
  const {
    data: progressData,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useStoryProgress();
  const completedStoryIds = useStoryCompletionStore(
    (state) => state.completedStoryIds,
  );

  const storyProgress = useMemo(() => {
    if (!progressData || !Array.isArray(progressData)) return [];
    return progressData;
  }, [progressData]);

  const storyCards = useMemo(() => {
    if (!stories || stories.length === 0) return [];

    const userCreatedAt = userProfile?.created_at || null;
    return mapStoriesToCards(
      stories,
      userCreatedAt,
      storyProgress,
      completedStoryIds,
    );
  }, [stories, userProfile, storyProgress, completedStoryIds]);

  return {
    storyCards,
    isLoading: isLoadingStories || isLoadingProfile || isLoadingProgress,
    error: storiesError ?? progressError ?? null,
  };
}
