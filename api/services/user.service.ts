import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  ApiResponse,
  UserCreateRequest,
  UserFullProfileResponse,
  UserResponse,
  UserUpdateRequest,
} from '../types'

/**
 * User Service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Get all users
   */
  async getAll(): Promise<ApiResponse<UserResponse[]>> {
    return apiClient.get<UserResponse[]>(API_ENDPOINTS.USER)
  },

  /**
   * Get a user by ID
   */
  async getById(id: string | number): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.USER_BY_ID(id))
  },

  /**
   * Get full profile for a user by ID
   * Matches GET /api/users/:id/full_profile/
   */
  async getFullProfile(
    id: string | number
  ): Promise<ApiResponse<UserFullProfileResponse>> {
    return apiClient.get<UserFullProfileResponse>(
      API_ENDPOINTS.USER_FULL_PROFILE(id),
      { skipVersion: true }
    )
  },

  /**
   * Create a new user
   */
  async create(data: UserCreateRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.post<UserResponse>(API_ENDPOINTS.USER_CREATE, data)
  },

  /**
   * Update an existing user
   */
  async update(
    id: string | number,
    data: UserUpdateRequest
  ): Promise<ApiResponse<UserResponse>> {
    return apiClient.patch<UserResponse>(API_ENDPOINTS.USER_UPDATE(id), data)
  },

  /**
   * Delete a user
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.USER_DELETE(id))
  },
}
