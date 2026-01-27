import { useAuthStore } from '@/stores/auth-store'
import { useUser, useUserFullProfile } from './use-user'
import type { UserResponse, UserFullProfileResponse } from '../types'

/**
 * Authentication Hooks
 * Provides easy access to current user information and authentication state
 */

/**
 * Get the current authenticated user ID
 * Returns null if not authenticated
 */
export function useAuthUserId(): number | null {
  const userId = useAuthStore((state) => state.userId)
  return userId
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  return isAuthenticated
}

/**
 * Get current user data (basic user info)
 * Automatically fetches user data based on authenticated user ID
 */
export function useCurrentUser() {
  const userId = useAuthUserId()
  return useUser(userId)
}

/**
 * Get current user's full profile
 * Automatically fetches full profile based on authenticated user ID
 */
export function useCurrentUserFullProfile() {
  const userId = useAuthUserId()
  return useUserFullProfile(userId)
}

/**
 * Auth store actions hook
 * Provides access to authentication actions (setUser, setHasCharacter, clearAuth)
 */
export function useAuthActions() {
  const setUser = useAuthStore((state) => state.setUser)
  const setHasCharacter = useAuthStore((state) => state.setHasCharacter)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  
  return {
    setUser,
    setHasCharacter,
    clearAuth,
  }
}

/**
 * Get current user ID or throw error if not authenticated
 * Useful for places where user ID is required
 */
export function useRequiredAuthUserId(): number {
  const userId = useAuthUserId()
  
  if (!userId) {
    throw new Error('User is not authenticated. Please log in.')
  }
  
  return userId
}

