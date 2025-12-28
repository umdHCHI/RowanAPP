import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  EquipmentResponse,
  EquipmentUnlockRequest,
  ApiResponse,
} from '../types'

/**
 * Equipment Service
 * Handles all equipment-related API calls
 */
export const equipmentService = {
  /**
   * Get all equipment (unlocked and locked)
   */
  async getAll(): Promise<ApiResponse<EquipmentResponse[]>> {
    return apiClient.get<EquipmentResponse[]>(API_ENDPOINTS.EQUIPMENT)
  },

  /**
   * Get only unlocked equipment
   */
  async getUnlocked(): Promise<ApiResponse<EquipmentResponse[]>> {
    const response = await apiClient.get<EquipmentResponse[]>(API_ENDPOINTS.EQUIPMENT)
    if (response.success && Array.isArray(response.data)) {
      return {
        ...response,
        data: response.data.filter((item) => item.unlocked),
      }
    }
    return response
  },

  /**
   * Get equipment by ID
   */
  async getById(id: string): Promise<ApiResponse<EquipmentResponse>> {
    return apiClient.get<EquipmentResponse>(API_ENDPOINTS.EQUIPMENT_BY_ID(id))
  },

  /**
   * Unlock equipment
   */
  async unlock(data: EquipmentUnlockRequest): Promise<ApiResponse<EquipmentResponse>> {
    return apiClient.post<EquipmentResponse>(
      `${API_ENDPOINTS.EQUIPMENT}/unlock`,
      data
    )
  },
}
