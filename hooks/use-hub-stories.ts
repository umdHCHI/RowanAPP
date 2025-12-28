import { useQuery } from '@tanstack/react-query'
import { storyService } from '@/api/services/story.service'

const hubStoriesKeys = {
  all: ['hub', 'stories'] as const,
  list: () => [...hubStoriesKeys.all, 'list'] as const,
}

/**
 * Fetch all stories for the hub
 */
export function useHubStories() {
  return useQuery({
    queryKey: hubStoriesKeys.list(),
    queryFn: async () => {
      const stories = await storyService.getAllStories()
      return stories
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

