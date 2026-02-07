import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useHubStories } from '../hub/use-hub-stories'
import { mapStoriesToCards } from '@/utils/story-mapper'
import { storyKeys, storyService, useCurrentUserFullProfile } from '@/api'
import type { UseStoryCardsResult } from '@/types/hooks'
import type { StoryProgressResponse } from '@/api/types'

/**
 * Get story cards with transformation logic
 * Includes daily unlock system based on user creation date
 */
export function useStoryCards(): UseStoryCardsResult {
  const { data: stories, isLoading: isLoadingStories, error: storiesError } = useHubStories()
  const { data: userProfile, isLoading: isLoadingProfile } = useCurrentUserFullProfile()
  const progressQueries = useQueries({
    queries: (stories || []).map((story) => ({
      queryKey: storyKeys.progressByStory(story.id),
      queryFn: () => storyService.getStoryProgressByStoryId(story.id),
      enabled: Boolean(story?.id),
      staleTime: 2 * 60 * 1000,
    })),
  })

  const storyProgress = useMemo(() => {
    return progressQueries
      .map((query) => query.data)
      .filter(Boolean) as StoryProgressResponse[]
  }, [progressQueries])

  const isLoadingProgress = progressQueries.some((query) => query.isLoading)
  const progressError = progressQueries.find((query) => query.error)?.error ?? null

  const storyCards = useMemo(() => {
    if (!stories || stories.length === 0) return []
    
    // Get user creation date from profile
    const userCreatedAt = userProfile?.created_at || null
    
    return mapStoriesToCards(stories, userCreatedAt, storyProgress)
  }, [stories, userProfile, storyProgress])

  return {
    storyCards,
    isLoading: isLoadingStories || isLoadingProfile || isLoadingProgress,
    error: storiesError || progressError,
  }
}
