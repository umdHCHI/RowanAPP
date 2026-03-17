import { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthActions } from './use-auth'
import { userService } from '../services/user.service'
import { characterService } from '../services/character.service'
import type { ApiError } from '../types'

type ProfileFlags = {
  hasCharacter: boolean
  hasCompletedOnboarding: boolean
}

function readProfileFlags(source: any): ProfileFlags {
  const profile = source?.profile ?? source

  const hasCharacter =
    profile?.has_character === true ||
    profile?.has_completed_character_creation === true ||
    !!profile?.character

  const hasCompletedOnboarding = profile?.has_completed_onboarding === true

  return { hasCharacter, hasCompletedOnboarding }
}

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
  const { setUser, setHasCharacter } = useAuthActions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clearError = useCallback(() => setError(null), [])

  async function login(username: string, password: string) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userService.login(username.trim(), password)

      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || 'Login failed')
      }

      const { token, user } = response.data
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id

      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID in response')
      }

      // First store the user + token so subsequent API calls are authenticated
      setUser(userId, token, false)

      const loginProfileFlags = readProfileFlags(user)

      // Then check if the user already has a character by hitting the
      // dedicated "my character" endpoint.
      let hasCharacter = loginProfileFlags.hasCharacter
      let hasCompletedOnboarding = loginProfileFlags.hasCompletedOnboarding

      try {
        const mine = await characterService.getMine()
        hasCharacter = hasCharacter || !!(mine?.success && mine.data)
      } catch (profileError: any) {
        const status = (profileError as ApiError)?.status
        // 404 just means "no character yet" – that's fine for first-time users.
        if (status && status !== 404) {
          console.warn('Failed to check character after login:', profileError)
        }
      }

      // Fallback: full profile often has onboarding/character flags even when getMine is unavailable.
      try {
        const fullProfile = await userService.getFullProfile(userId)
        const profileFlags = readProfileFlags(fullProfile)
        hasCharacter = hasCharacter || profileFlags.hasCharacter
        hasCompletedOnboarding = hasCompletedOnboarding || profileFlags.hasCompletedOnboarding
      } catch (profileError) {
        console.warn('Failed to fetch full profile after login:', profileError)
      }

      setHasCharacter(hasCharacter)

      if (hasCharacter || hasCompletedOnboarding) {
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

