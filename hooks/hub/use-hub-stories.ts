import { useQuery } from '@tanstack/react-query'
import { storyService } from '@/api/services/story.service'

const hubStoriesKeys = {
  all: ['hub', 'stories'] as const,
  list: () => [...hubStoriesKeys.all, 'list'] as const,
}

/**
 * Fetch all stories for the hub
 * Story metadata doesn't change on the backend - only unlock status changes client-side
 */
export function useHubStories() {
  return useQuery({
    queryKey: hubStoriesKeys.list(),
    queryFn: async () => {
      const stories = await storyService.getAllStories()
      return stories
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only refetch when component first mounts (app launch)
    refetchOnReconnect: false,
  })
}
