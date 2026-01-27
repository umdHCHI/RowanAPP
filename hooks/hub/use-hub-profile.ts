import { useEffect } from 'react'
import { useCurrentUserFullProfile } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToLumen } from '@/utils/profile-mapper'
import type { UseHubProfileResult } from '@/types/hooks'

/**
 * Only loading expierence to lumens so we can view the player expierence in the game(as Lumans)
 */
export function useHubProfile(): UseHubProfileResult {
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
    error: error || null,
  }
}
