import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  AttributesResponse,
  AttributesUpdateRequest,
  ApiResponse,
} from '../types'

/**
 * Attributes Service
 * Handles all attribute-related API calls
 */
export const attributesService = {
  /**
   * Get current attributes
   */
  async get(): Promise<ApiResponse<AttributesResponse>> {
    return apiClient.get<AttributesResponse>(API_ENDPOINTS.ATTRIBUTES)
  },

  /**
   * Update attributes
   */
  async update(data: AttributesUpdateRequest): Promise<ApiResponse<AttributesResponse>> {
    return apiClient.patch<AttributesResponse>(API_ENDPOINTS.ATTRIBUTES_UPDATE, data)
  },
}
