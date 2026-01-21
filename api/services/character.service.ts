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
    return apiClient.get<CharacterResponse[]>(API_ENDPOINTS.CHARACTERS, { skipVersion: true })
  },

  /**
   * Get a character by ID
   */
  async getById(id: string): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.get<CharacterResponse>(API_ENDPOINTS.CHARACTER_BY_ID(id), { skipVersion: true })
  },

  /**
   * Create a new character
   */
  async create(data: CharacterCreateRequest): Promise<ApiResponse<CharacterResponse>> {
    const response = await apiClient.post<CharacterResponse>(API_ENDPOINTS.CHARACTERS, data, { skipVersion: true })
    
    // Backend returns character data directly, not wrapped in { success, data }
    // Wrap it in ApiResponse format for consistency
    if (response && typeof response === 'object' && 'id' in response) {
      // Direct character object - wrap it
      return {
        success: true,
        data: response as unknown as CharacterResponse,
      }
    }
    
    // If already wrapped, return as-is
    return response as ApiResponse<CharacterResponse>
  },

  /**
   * Update an existing character
   */
  async update(
    id: string,
    data: CharacterUpdateRequest
  ): Promise<ApiResponse<CharacterResponse>> {
    try {
      const response = await apiClient.patch<CharacterResponse>(API_ENDPOINTS.CHARACTER_BY_ID(id), data, { skipVersion: true })
      
      // Backend returns character data directly, not wrapped in { success, data }
      // Wrap it in ApiResponse format for consistency
      if (response && typeof response === 'object' && 'id' in response && !('success' in response)) {
        // Direct character object - wrap it
        return {
          success: true,
          data: response as unknown as CharacterResponse,
        }
      }
      
      // If already wrapped, return as-is
      return response as ApiResponse<CharacterResponse>
    } catch (error: any) {
      // Re-throw to preserve error details
      throw error
    }
  },

  /**
   * Delete a character
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.CHARACTER_BY_ID(id))
  },
}
