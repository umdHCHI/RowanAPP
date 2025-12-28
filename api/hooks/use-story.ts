import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storyService } from '../services/story.service'
import type { StoryProgressResponse, StoryProgressUpdateRequest, StoryResponse } from '../types'
import type { StoryChapter } from '../../types/story'

/**
 * Query Keys
 */
export const storyKeys = {
  all: ['story'] as const,
  progress: () => [...storyKeys.all, 'progress'] as const,
  chapters: () => [...storyKeys.all, 'chapters'] as const,
  chapter: (id: number) => [...storyKeys.chapters(), id] as const,
  stories: () => [...storyKeys.all, 'stories'] as const,
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
 * Get all story chapters
 */
export function useStoryChapters() {
  return useQuery({
    queryKey: storyKeys.chapters(),
    queryFn: async () => {
      const response = await storyService.getAllChapters()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch story chapters')
      }
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (chapters don't change often)
  })
}

/**
 * Get a specific story chapter
 */
export function useStoryChapter(chapterId: number | null) {
  return useQuery({
    queryKey: storyKeys.chapter(chapterId!),
    queryFn: async () => {
      if (chapterId === null) throw new Error('Chapter ID is required')
      const response = await storyService.getChapter(chapterId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch story chapter')
      }
      return response.data
    },
    enabled: chapterId !== null,
    staleTime: 10 * 60 * 1000,
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
