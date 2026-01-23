import { useEffect } from 'react'
import { useCurrentUserFullProfile } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToLumen } from '@/utils/profile-mapper'

/**
 * Load user profile and map to attributes in the game store
 */
export function useHubProfile() {
  const { data: profile, isLoading, error } = useCurrentUserFullProfile()
  const setLumen = useGameStore((state) => state.setLumen)

  useEffect(() => {
    if (!profile) return

    const mappedLumen = mapProfileToLumen(profile)
    if (mappedLumen) {
      setLumen(mappedLumen)
    }
  }, [profile, setLumen])

  return {
    isLoading,
    error,
  }
}

