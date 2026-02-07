import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  ApiResponse,
  UserFullProfileResponse,
  UserResponse,
  UserUpdateRequest,
} from '../types'

function normalizeLoginResponse(raw: unknown): ApiResponse<{ token: string; user: UserResponse }> {
  if (!raw || typeof raw !== 'object') {
    return {
      success: false,
      data: { token: '', user: {} as UserResponse },
      message: 'Login failed: invalid response from server',
    }
  }

  // Backend might return:
  // - ApiResponse<{ token, user }>
  // - { token, user }
  // - { key, user } (some DRF setups use "key" instead of "token")
  const maybeWrapped = raw as any

  if (typeof maybeWrapped.success === 'boolean' && maybeWrapped.data) {
    return maybeWrapped as ApiResponse<{ token: string; user: UserResponse }>
  }

  const token = maybeWrapped.token ?? maybeWrapped.key
  const user = maybeWrapped.user

  if (typeof token === 'string' && token.trim() && user) {
    return {
      success: true,
      data: { token, user },
    }
  }

  return {
    success: false,
    data: { token: '', user: {} as UserResponse },
    message: maybeWrapped?.message || maybeWrapped?.detail || 'Login failed',
  }
}

/**
 * User Service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Login user and get DRF Token authentication
   * Returns token and user data
   * Backend endpoint: users/auth/login/
   * Auth format: Authorization: Token <token>
   */
  async login(
    username: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: UserResponse }>> {
    const body = {
      username,
      password,
    }

    const loginOpts = { skipAuth: true, suppressErrorLog: true as const }
    const raw = await apiClient.post<unknown>(API_ENDPOINTS.USER_LOGIN, body, loginOpts)
    return normalizeLoginResponse(raw)
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
      API_ENDPOINTS.USER_FULL_PROFILE,
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
   * Update an existing user
   */
  async update(
    id: string | number,
    data: UserUpdateRequest
  ): Promise<ApiResponse<UserResponse>> {
    return apiClient.patch<UserResponse>(API_ENDPOINTS.USER_BY_ID(id), data)
  },

  /**
   * Delete a user
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.USER_BY_ID(id))
  },

  /**
   * Update user notification preferences
   */
  async updateNotificationsEnabled(
    id: string | number,
    notificationsEnabled: boolean
  ): Promise<ApiResponse<UserResponse>> {
    return apiClient.patch<UserResponse>(API_ENDPOINTS.USER_BY_ID(id), {
      notifications_enabled: notificationsEnabled,
    })
  },
}
