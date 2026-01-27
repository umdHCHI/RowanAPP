import { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthActions } from './use-auth'
import { userService } from '../services/user.service'
import type { ApiError } from '../types'

function getLoginErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'An error occurred during login'
  const ae = err as Error & Partial<ApiError>
  if (ae.message && typeof ae.message === 'string' && ae.message.trim()) {
    return ae.message
  }
  if (ae.errors && typeof ae.errors === 'object') {
    const flat = Object.values(ae.errors).flat().filter((s): s is string => typeof s === 'string')
    if (flat[0]) return flat[0]
  }
  if (ae.status === 401) return 'Invalid username or password'
  return 'An error occurred during login'
}

/**
 * Custom hook for handling Token login
 *

 */
export function useLogin() {
  const router = useRouter()
  const { setUser } = useAuthActions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clearError = useCallback(() => setError(null), [])

  async function login(email: string, password: string) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userService.login(email.trim(), password)

      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || 'Login failed')
      }

      const { token, user } = response.data
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id

      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID in response')
      }

      let hasCharacter = false
      try {
        const profile = await userService.getFullProfile(userId)
        hasCharacter = profile?.character != null
      } catch (profileError) {
        console.warn('Failed to fetch user profile after login:', profileError)
      }

      setUser(userId, token, hasCharacter)

      if (hasCharacter) {
        router.replace('/hub')
      } else {
        router.replace('/character-creator')
      }

      return { success: true, userId, user }
    } catch (err) {
      setError(getLoginErrorMessage(err))
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
    error,
    clearError,
  }
}

