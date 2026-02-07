import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storyService } from '../services/story.service'
import type { StoryProgressResponse, StoryProgressUpdateRequest, StoryResponse } from '../types'

/**
 * Query Keys
 */
export const storyKeys = {
  all: ['story'] as const,
  progress: () => [...storyKeys.all, 'progress'] as const,
  progressByStory: (storyId: number | string) => [...storyKeys.all, 'progress', storyId] as const,
  stories: () => [...storyKeys.all, 'stories'] as const,
  passageChoices: (passagePk: number | string | null) =>
    [...storyKeys.all, 'passage-choices', passagePk] as const,
}

/**
 * Get story progress
 */
export function useStoryProgress() {
  return useQuery({
    queryKey: storyKeys.progress(),
    queryFn: async () => {
      const response = await storyService.getProgress()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch story progress')
      }
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get progress for a specific story
 */
export function useStoryProgressByStoryId(storyId: number | string | null) {
  return useQuery({
    queryKey: storyId ? storyKeys.progressByStory(storyId) : storyKeys.progress(),
    queryFn: async () => {
      if (!storyId) return null
      return storyService.getStoryProgressByStoryId(storyId)
    },
    enabled: !!storyId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Update story progress
 */
export function useUpdateStoryProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StoryProgressUpdateRequest) => {
      const response = await storyService.updateProgress(data)
      if (!response.success) {
        throw new Error(response.message || 'Failed to update story progress')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.progress() })
    },
  })
}

/**
 * Get all stories from the catalog
 */
export function useStories() {
  return useQuery({
    queryKey: storyKeys.stories(),
    queryFn: async () => {
      const stories = await storyService.getAllStories()
      return stories
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (stories don't change often)
  })
}

/**
 * Get a specific passage for a story
 */
export function useStoryPassage(storyId: number | null, passageId: string | null) {
  return useQuery({
    queryKey: [...storyKeys.all, 'passage', storyId, passageId],
    queryFn: async () => {
      if (!storyId || !passageId) throw new Error('Story ID and Passage ID are required')
      const response = await storyService.getPassage(storyId, passageId)
      return response
    },
    enabled: !!storyId && !!passageId,
    staleTime: 10 * 60 * 1000, // 10 minutes (passages don't change)
  })
}

/**
 * Get choices for a specific passage (passage PK)
 */
export function usePassageChoices(passagePk: number | string | null) {
  return useQuery({
    queryKey: storyKeys.passageChoices(passagePk),
    queryFn: async () => {
      if (!passagePk) throw new Error('Passage ID is required')
      return storyService.getPassageChoices(passagePk)
    },
    enabled: !!passagePk,
    staleTime: 5 * 60 * 1000,
  })
}