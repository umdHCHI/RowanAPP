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
   */
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<JournalEntryResponse>> {
    const response = await apiClient.get<JournalEntryResponse[]>(
      `${API_ENDPOINTS.JOURNAL_WRITING}?page=${page}&limit=${limit}`
    )
    // If your API returns pagination metadata, it should be in the response
    // Adjust this based on your actual API structure
    return response as PaginatedResponse<JournalEntryResponse>
  },

  /**
   * Get a journal entry by ID
   */
  async getById(id: string): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.get<JournalEntryResponse>(API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id))
  },

  /**
   * Create a new journal entry
   */
  async create(
    data: JournalEntryCreateRequest
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.post<JournalEntryResponse>(API_ENDPOINTS.JOURNAL_WRITING, data)
  },

  /**
   * Update a journal entry
   */
  async update(
    id: string,
    data: JournalEntryUpdateRequest
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.patch<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id),
      data
    )
  },

  /**
   * Delete a journal entry
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id))
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
    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response
    }
    // If wrapped in ApiResponse, extract data
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<JournalPromptResponse[]>).data
    }
    return []
  },
}
