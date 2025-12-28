import { useMemo } from 'react'
import { useHubStories } from './use-hub-stories'
import { mapStoriesToCards } from '@/utils/story-mapper'
import type { StoryCard } from '@/types/hub'

/**
 * Get story cards with transformation logic
 */
export function useStoryCards() {
  const { data: stories, isLoading, error } = useHubStories()

  const storyCards = useMemo(() => {
    if (!stories || stories.length === 0) return []
    return mapStoriesToCards(stories)
  }, [stories])

  return {
    storyCards,
    isLoading,
    error,
  }
}

