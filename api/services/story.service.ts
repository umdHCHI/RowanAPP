import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  StoryProgressResponse,
  StoryProgressUpdateRequest,
  StoryResponse,
  ApiResponse,
} from '../types'
import type { StoryChapter } from '../../types/story'

/**
 * Story Service
 * Handles all story-related API calls
 */
export const storyService = {
  /**
   * Get current story progress
   */
  async getProgress(): Promise<ApiResponse<StoryProgressResponse>> {
    return apiClient.get<StoryProgressResponse>(API_ENDPOINTS.STORY_PROGRESS)
  },

  /**
   * Update story progress
   */
  async updateProgress(
    data: StoryProgressUpdateRequest
  ): Promise<ApiResponse<StoryProgressResponse>> {
    return apiClient.patch<StoryProgressResponse>(API_ENDPOINTS.STORY_PROGRESS, data)
  },

  /**
   * Get a specific story chapter
   * Note: This might return StoryChapter from your types or from the API
   */
  async getChapter(chapterId: number): Promise<ApiResponse<StoryChapter>> {
    return apiClient.get<StoryChapter>(API_ENDPOINTS.STORY_CHAPTER(chapterId))
  },

  /**
   * Get all available story chapters
   */
  async getAllChapters(): Promise<ApiResponse<StoryChapter[]>> {
    return apiClient.get<StoryChapter[]>(API_ENDPOINTS.STORY)
  },

  /**
   * Get all stories from the backend
   * This endpoint returns the full story data with chapters
   * Note: The backend returns a direct array, not wrapped
   */
  async getAllStories(): Promise<StoryResponse[]> {
    const response = await apiClient.get<StoryResponse[]>(API_ENDPOINTS.STORY_STORIES, {
      skipVersion: true,
    })

    // Handle direct array response (from example project)
    if (Array.isArray(response)) {
      return response
    }

    // Handle wrapped ApiResponse format
    if (response && typeof response === 'object' && 'data' in response) {
      if (Array.isArray(response.data)) {
        return response.data
      }
    }

    console.warn('Unexpected response format from getAllStories:', response)
    return []
  },

  /**
   * Convenience: get a single story by id from the catalog
   */
  async getStoryById(storyId: number): Promise<StoryResponse | null> {
    const stories = await this.getAllStories()
    const story = stories.find((s) => s.id === storyId) || null
    if (!story) console.warn(`Story with id ${storyId} not found in catalog`)
    return story
  },

  /**
   * Restart a story on the backend to (re)create progress and get starting passage
   * Mirrors restartStory logic from the thesis app (POST /story/stories/{id}/restart/)
   */
  async restartStory(
    storyId: number,
    chapterId?: number
  ): Promise<{ starting_passage: string }> {
    const payload = chapterId ? { chapter_id: chapterId } : {}
    let url = `/story/stories/${storyId}/restart/`
    if (chapterId) url = `/story/stories/${storyId}/restart/?chapter_id=${chapterId}`

    const response = await apiClient.post<{ starting_passage: string }>(url, payload, {
      skipVersion: true,
    })
    
    // Handle both wrapped (ApiResponse) and direct responses
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data
      }
      // If it's already the data structure we expect, return it directly
      if ('starting_passage' in response) {
        return response
      }
    }
    
    return response
  },

  /**
   * Fetch a specific passage for a story
   * Backend returns { story, chapter_title, passage, progress, ... }
   */
  async getPassage(storyId: number, passageId: string): Promise<any> {
    const url = `/story/stories/${storyId}/passage/${passageId}/`
    const response = await apiClient.get<any>(url, { skipVersion: true } as any)
    
    // Handle both wrapped (ApiResponse) and direct responses
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data
      }
      // If it's already the data structure we expect, return it directly
      if ('passage' in response || 'story' in response) {
        return response
      }
    }
    
    return response
  },

  /**
   * Make a choice in the story and get the next passage state back
   * Mirrors makeChoice logic from the thesis app (POST story/make_choice/)
   */
  async makeChoice(
    storyId: number | string,
    targetPassageId: string,
    additionalPayload?: Record<string, unknown>
  ): Promise<any> {
    const payload = {
      story_id: storyId,
      target_passage_id: targetPassageId,
      ...(additionalPayload || {}),
    }

    const response = await apiClient.post<any>('/story/make_choice/', payload, {
      skipVersion: true,
    })
    
    // Handle both wrapped (ApiResponse) and direct responses
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data
      }
      // If it's already the data structure we expect, return it directly
      if ('passage' in response || 'story' in response) {
        return response
      }
    }
    
    return response
  },
}
