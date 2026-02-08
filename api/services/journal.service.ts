import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  JournalEntryResponse,
  JournalEntryCreateRequest,
  JournalEntryUpdateRequest,
  JournalPromptResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types'

/**
 * Journal Service
 * Handles all journal-related API calls
 */
export const journalService = {
  /**
   * Get all journal entries (paginated)
   * Note: This endpoint doesn't use version prefix
   */
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<JournalEntryResponse>> {
    const response = await apiClient.get<JournalEntryResponse[]>(
      `${API_ENDPOINTS.JOURNAL_COMPLETED_ENTRIES}?page=${page}&limit=${limit}`,
      { skipVersion: true }
    )
    // If your API returns pagination metadata, it should be in the response
    // Adjust this based on your actual API structure
    return response as PaginatedResponse<JournalEntryResponse>
  },

  /**
   * Get a journal entry by ID
   * Note: This endpoint doesn't use version prefix
   */
  async getById(id: string): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.get<JournalEntryResponse>(API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id), {
      skipVersion: true,
    })
  },

  /**
   * Create a new journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async create(
    data: JournalEntryCreateRequest
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.post<JournalEntryResponse>(API_ENDPOINTS.JOURNAL_COMPLETED_ENTRIES, data, {
      skipVersion: true,
    })
  },

  /**
   * Update a journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async update(
    id: string,
    data: JournalEntryUpdateRequest
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.patch<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id),
      data,
      { skipVersion: true }
    )
  },

  /**
   * Delete a journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id), {
      skipVersion: true,
    })
  },

  /**
   * Get all journal prompts
   * Note: This endpoint returns an array directly, not wrapped in ApiResponse
   */
  async getPrompts(): Promise<JournalPromptResponse[]> {
    // Skip version prefix as this endpoint doesn't use versioning
    const response = await apiClient.get<JournalPromptResponse[]>(
      API_ENDPOINTS.JOURNAL_PROMPTS,
      { skipVersion: true }
    )
    const normalizePrompt = (prompt: Partial<JournalPromptResponse>, index: number): JournalPromptResponse => {
      return {
        id: Number(prompt.id ?? 0),
        prompt_id: String(prompt.prompt_id ?? ''),
        text: String(prompt.text ?? ''),
        category: String(prompt.category ?? 'journal'),
        skill_category: String(prompt.skill_category ?? prompt.category ?? 'reflection'),
        difficulty: (prompt.difficulty ?? 'Beginner') as JournalPromptResponse['difficulty'],
        is_active: prompt.is_active ?? true,
        order: Number.isFinite(prompt.order) ? Number(prompt.order) : index + 1,
        required_story_id: prompt.required_story_id ?? null,
        required_passage_id: prompt.required_passage_id ?? null,
        personality_traits: Array.isArray(prompt.personality_traits) ? prompt.personality_traits : [],
        unlocked: prompt.unlocked ?? true,
        completed: prompt.completed ?? false,
        created_at: String(prompt.created_at ?? ''),
        updated_at: String(prompt.updated_at ?? ''),
      }
    }

    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response.map(normalizePrompt)
    }
    // If wrapped in ApiResponse, extract data
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as ApiResponse<JournalPromptResponse[]>).data
      return Array.isArray(data) ? data.map(normalizePrompt) : []
    }
    return []
  },

  /**
   * Get a journal prompt by its prompt_id
   * Fetches all prompts and finds the one matching the promptId
   */
  async getJournalPromptById(promptId: string): Promise<JournalPromptResponse | null> {
    const prompts = await this.getPrompts()
    const prompt = prompts.find((p) => p.prompt_id === promptId)
    return prompt || null
  },
}
