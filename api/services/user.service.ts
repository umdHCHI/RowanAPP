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
   * Login user and get authentication token
   */
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: UserResponse }>> {
    return apiClient.post<{ token: string; user: UserResponse }>(
      API_ENDPOINTS.USER_LOGIN,
      { email, password }
    )
  },

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
  ): Promise<UserFullProfileResponse> {
    // NOTE: This endpoint returns the raw full profile object, not wrapped in { success, data }.
    // The ApiClient is typed as returning ApiResponse<T>, but for this endpoint the backend
    // actually responds with a plain UserFullProfileResponse. We cast here so callers can work
    // with the correct shape.
    const raw = await apiClient.get<UserFullProfileResponse>(
      API_ENDPOINTS.USER_FULL_PROFILE(id),
      { skipVersion: true }
    )

    // If the response is wrapped in { data, success }, extract data
    // Otherwise, use the response directly
    if ('data' in raw && raw.data) {
      return raw.data as UserFullProfileResponse
    }

    // Response is already the direct object (backend returns it directly)
    // Cast to bypass TypeScript since we know the actual shape
    const profile = raw as unknown as UserFullProfileResponse
    return profile
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
