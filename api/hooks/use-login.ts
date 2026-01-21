import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthActions } from './use-auth'
import { userService } from '../services/user.service'

/**
 * Custom hook for handling DRF Token login
 * 
 * Backend: auth/login/
 * Auth format: Authorization: Token <token>
 * 
 * Usage:
 * ```tsx
 * const { login, isLoading, error } = useLogin()
 * 
 * await login('user@example.com', 'password')
 * ```
 */
export function useLogin() {
  const router = useRouter()
  const { setUser } = useAuthActions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(email: string, password: string) {
    setIsLoading(true)
    setError(null)

    try {
      // Call the login function (DRF Token auth)
      const response = await userService.login(email.trim(), password)

      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || 'Login failed')
      }

      const { token, user } = response.data

      // Extract user ID from response (user object is included in response)
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id

      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID in response')
      }

      // Store token and user ID in auth store
      setUser(userId, token)

      // Decide where to send the user next based on whether they have a character yet
      const fullProfile = await userService.getFullProfile(userId)
      const hasCharacter = !!fullProfile?.character
      router.replace(hasCharacter ? '/hub' : '/character-creator')

      return { success: true, userId, user }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
    error,
  }
}

