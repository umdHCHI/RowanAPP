import { useMemo } from 'react'
import { useHubStories } from './use-hub-stories'
import { mapStoriesToCards } from '@/utils/story-mapper'
import { useCurrentUserFullProfile } from '@/api'
import type { StoryCard } from '@/types/hub'

/**
 * Get story cards with transformation logic
 * Includes daily unlock system based on user creation date
 */
export function useStoryCards() {
  const { data: stories, isLoading: isLoadingStories, error: storiesError } = useHubStories()
  const { data: userProfile, isLoading: isLoadingProfile } = useCurrentUserFullProfile()

  const storyCards = useMemo(() => {
    if (!stories || stories.length === 0) return []
    
    // Get user creation date from profile
    const userCreatedAt = userProfile?.profile?.created_at || null
    
    return mapStoriesToCards(stories, userCreatedAt)
  }, [stories, userProfile])

  return {
    storyCards,
    isLoading: isLoadingStories || isLoadingProfile,
    error: storiesError,
  }
}

