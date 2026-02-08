import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Authentication Store
 * Manages the current logged-in user's ID and authentication state
 */

const AUTH_STORAGE_KEY = 'the-archive-auth-storage'

interface AuthState {
  // Current user ID (null when not authenticated)
  userId: number | null
  
  // DRF Token (for API requests)
  // Backend uses: Authorization: Token <token>
  token: string | null
  
  // Whether the user has created a character
  hasCharacter: boolean
  
  // Actions
  setUser: (userId: number, token: string, hasCharacter?: boolean) => void
  setHasCharacter: (hasCharacter: boolean) => void
  clearAuth: () => void
  clearAuthStorage: () => Promise<void>
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      token: null,
      hasCharacter: false,

      setUser: (userId, token, hasCharacter = false) => {
        set({ 
          userId, 
          token: token || null,
          hasCharacter
        })
      },

      setHasCharacter: (hasCharacter) => {
        set({ hasCharacter })
      },

      clearAuth: () => {
        set({ userId: null, token: null, hasCharacter: false })
      },

      clearAuthStorage: async () => {
        set({ userId: null, token: null, hasCharacter: false })
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      },

      isAuthenticated: () => {
        const state = get()
        return state.userId !== null && state.token !== null
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

