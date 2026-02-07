import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  StoryProgressResponse,
  StoryProgressUpdateRequest,
  StoryResponse,
  ApiResponse,
} from '../types'

/**
 * Story Service
 * Handles all story-related API calls
 */
export const storyService = {
  /**
   * Start story with fallback to restart on 5xx/network
   */
  async startStoryWithFallback(storyId: number | string): Promise<any> {
    try {
      return await this.startStory(Number(storyId))
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status
      const shouldFallback = !status || status >= 500
      if (!shouldFallback) throw error
      return this.restartStory(Number(storyId))
    }
  },
  /**
   * Get current story progress
   */
  async getProgress(): Promise<ApiResponse<StoryProgressResponse[]>> {
    const raw = await apiClient.get<unknown>(API_ENDPOINTS.STORY_PROGRESS)

    if (Array.isArray(raw)) {
      return { success: true, data: raw as StoryProgressResponse[] }
    }

    if (raw && typeof raw === 'object') {
      const maybeWrapped = raw as ApiResponse<StoryProgressResponse[]>
      if (typeof maybeWrapped.success === 'boolean' && Array.isArray(maybeWrapped.data)) {
        return maybeWrapped
      }

      if ('data' in (raw as any) && Array.isArray((raw as any).data)) {
        return {
          success: true,
          data: (raw as any).data as StoryProgressResponse[],
        }
      }

      if ('results' in (raw as any) && Array.isArray((raw as any).results)) {
        return {
          success: true,
          data: (raw as any).results as StoryProgressResponse[],
        }
      }
    }

    return {
      success: false,
      data: [],
      message: 'Unexpected story progress response shape',
    }
  },

  /**
   * Get progress for a specific story
   */
  async getStoryProgressByStoryId(
    storyId: number | string
  ): Promise<StoryProgressResponse | null> {
    try {
      const response = await apiClient.get<StoryProgressResponse>(
        API_ENDPOINTS.STORY_PROGRESS_BY_ID(storyId),
        {
          suppressErrorLog: true,
        }
      )

      if (response && typeof response === 'object' && 'data' in response) {
        if (response.success && response.data) return response.data
        if ('data' in response) return (response as ApiResponse<StoryProgressResponse>).data || null
      }

      return response as unknown as StoryProgressResponse
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status
      if (status === 404) return null
      throw error
    }
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
   * Get all stories from the backend
   * Note: The backend may return a direct array or wrapped in ApiResponse
   */
  async getAllStories(): Promise<StoryResponse[]> {
    const response = await apiClient.get<StoryResponse[]>(API_ENDPOINTS.STORY_STORIES, {
      skipVersion: true,
    })

    // Handle wrapped ApiResponse format (standard case)
    if (response && typeof response === 'object' && 'data' in response) {
      if (response.success && Array.isArray(response.data)) {
        return response.data
      }
      // If response failed, log and return empty array
      if (!response.success) {
        console.warn('Failed to fetch stories:', response.message)
        return []
      }
      // If data exists but is not an array, return empty array
      if (response.data) {
        console.warn('Unexpected response data format from getAllStories:', response.data)
        return []
      }
    }

    // Handle direct array response (if backend returns array directly - unlikely but possible)
    if (Array.isArray(response)) {
      return response
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
   * Start a story on the backend to create progress and get the starting passage
   * POST /story/stories/{id}/start/
   */
  async startStory(storyId: number): Promise<any> {
    const url = `/story/stories/${storyId}/start/`

    const response = await apiClient.post<any>(url, {}, {
      skipVersion: true,
    })

    // Handle both wrapped (ApiResponse) and direct responses
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data
      }
      if ('passage' in response || 'story' in response || 'starting_passage_id' in response) {
        return response
      }
    }

    return response
  },

  /**
   * Restart a story on the backend to (re)create progress and get starting passage
   * Mirrors restartStory logic from the thesis app (POST /story/stories/{id}/restart/)
   */
  async restartStory(storyId: number): Promise<any> {
    const url = `/story/stories/${storyId}/restart/`

    const response = await apiClient.post<any>(url, {}, {
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
   * Backend returns { story, passage, progress, ... }
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
   * Fetch all passages for a story
   * GET /story/passages/?story_id={storyId}
   */
  async getStoryPassages(storyId: number | string): Promise<any[]> {
    const query = storyId ? `?story_id=${encodeURIComponent(String(storyId))}` : ''
    const url = `/story/passages/${query}`
    let nextUrl: string | null = url
    const allPassages: any[] = []

    while (nextUrl) {
      const response = await apiClient.get<any>(nextUrl, { skipVersion: true } as any) as any

      if (Array.isArray(response)) {
        allPassages.push(...response)
        break
      }

      if (response && typeof response === 'object') {
        if ('results' in response && Array.isArray((response as any).results)) {
          allPassages.push(...(response as any).results)
          nextUrl = (response as any).next || null
          continue
        }
        if ('data' in response && Array.isArray(response.data)) {
          allPassages.push(...response.data)
          break
        }
      }

      break
    }

    return allPassages
  },

  /**
   * Fetch choices for a passage (passage PK)
   * GET /story/passages/{passagePk}/choices/
   */
  async getPassageChoices(passagePk: string | number): Promise<any[]> {
    const url = `/story/passages/${passagePk}/choices/`
    const response = await apiClient.get<any>(url, { skipVersion: true } as any)

    if (Array.isArray(response)) {
      return response
    }

    if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        return response.data
      }
      if ('results' in response && Array.isArray((response as any).results)) {
        return (response as any).results
      }
    }

    return []
  },

  /**
   * Make a choice in the story and get the next passage state back
   * Mirrors makeChoice logic from the thesis app (POST story/make_choice/)
   */
  async makeChoice(
    storyId: number | string,
    targetPassageId: string,
    choiceText?: string,
    additionalPayload?: Record<string, unknown>
  ): Promise<any> {
    const payload = {
      target_passage_id: targetPassageId,
      choice_text: choiceText,
      ...(additionalPayload || {}),
    }

    const response = await apiClient.post<any>(`/story/stories/${storyId}/make-choice/`, payload, {
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
