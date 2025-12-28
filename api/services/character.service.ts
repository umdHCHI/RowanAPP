import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  CharacterResponse,
  CharacterCreateRequest,
  CharacterUpdateRequest,
  ApiResponse,
} from '../types'

/**
 * Character Service
 * Handles all character-related API calls
 */
export const characterService = {
  /**
   * Get all characters for the current user
   */
  async getAll(): Promise<ApiResponse<CharacterResponse[]>> {
    return apiClient.get<CharacterResponse[]>(API_ENDPOINTS.CHARACTERS)
  },

  /**
   * Get a character by ID
   */
  async getById(id: string): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.get<CharacterResponse>(API_ENDPOINTS.CHARACTER_BY_ID(id))
  },

  /**
   * Create a new character
   */
  async create(data: CharacterCreateRequest): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.post<CharacterResponse>(API_ENDPOINTS.CHARACTERS, data)
  },

  /**
   * Update an existing character
   */
  async update(
    id: string,
    data: CharacterUpdateRequest
  ): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.patch<CharacterResponse>(API_ENDPOINTS.CHARACTER_BY_ID(id), data)
  },

  /**
   * Delete a character
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.CHARACTER_BY_ID(id))
  },
}
