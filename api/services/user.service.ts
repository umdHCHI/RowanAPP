import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  ApiResponse,
  UserCreateRequest,
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
   * Backend endpoint: auth/login/
   * Auth format: Authorization: Token <token>
   */
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: UserResponse }>> {
    const body = {
      // Backend commonly expects "username" for login. Some setups accept "email".
      username: email,
      email,
      password,
    }

    // Prefer /api/auth/login/ (most of your app lives under /api/)
    try {
      const raw = await apiClient.post<unknown>(
        API_ENDPOINTS.USER_LOGIN,
        body,
        { skipAuth: true, useRootBase: false }
      )
      return normalizeLoginResponse(raw)
    } catch (error: any) {
      // Some deployments mount auth at root (no /api/)
      if (error?.status !== 404) throw error

      const raw = await apiClient.post<unknown>(
        API_ENDPOINTS.USER_LOGIN,
        body,
        { skipAuth: true, useRootBase: true }
      )
      return normalizeLoginResponse(raw)
    }
  },

  /**
   * Logout current user (best-effort)
   * Backend typically invalidates the current token.
   * 
   * Note: Logout is primarily about clearing local auth state.
   * If the backend endpoint doesn't exist (404) or fails, we still succeed
   * to allow users to log out locally. Error logs are suppressed for expected 404s.
   */
  async logout(): Promise<ApiResponse<null>> {
    // Try root-mounted auth (/auth/logout/) first, then fallback to /api/auth/logout/
    // If both fail (especially 404), we still succeed since logout is primarily local.
    // Suppress error logs for expected 404s to avoid log spam.
    const attempts = [
      { useRootBase: true },
      { useRootBase: false },
    ]

    for (const attempt of attempts) {
      try {
        const raw = await apiClient.post<unknown>(
          API_ENDPOINTS.USER_LOGOUT,
          undefined,
          { skipAuth: false, suppressErrorLog: true, ...attempt }
        )

        if (raw && typeof raw === 'object' && 'success' in (raw as any)) return raw as ApiResponse<null>
        return { success: true, data: null }
      } catch (error: any) {
        // If it's a 404, try the next attempt (different base URL)
        if (error?.status === 404 && attempt === attempts[0]) {
          continue // Try next attempt
        }
        
        // For any other error on the first attempt, or 404 on the second attempt,
        // or any non-404 error: silently succeed (logout is primarily local)
        // Error logs are already suppressed via suppressErrorLog option
        return { success: true, data: null }
      }
    }

    // If we get here, both attempts were skipped somehow - still succeed
    return { success: true, data: null }
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
