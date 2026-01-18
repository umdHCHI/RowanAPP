import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Authentication Store
 * Manages the current logged-in user's ID and authentication state
 * 
 * TODO: Implement login page and replace hardcoded default user ID with
 * actual authentication flow (login, token management, etc.)
 */

interface AuthState {
  // Current user ID (null when not authenticated)
  userId: number | null
  
  // Authentication token (for future use with login)
  token: string | null
  
  // Actions
  setUser: (userId: number, token?: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

// Default to user ID 1 (admin) for development
// TODO: Remove this default once login page is implemented
const DEFAULT_USER_ID = 1

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Default to user ID 1 for now (admin user)
      userId: DEFAULT_USER_ID,
      token: null,

      setUser: (userId, token) => {
        set({ userId, token: token || null })
      },

      clearAuth: () => {
        set({ userId: null, token: null })
      },

      isAuthenticated: () => {
        return get().userId !== null
      },
    }),
    {
      name: 'the-archive-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

