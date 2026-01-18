import { useEffect } from 'react'
import { useCurrentUserFullProfile } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToAttributes } from '@/utils/profile-mapper'

/**
 * Load user profile and map to attributes in the game store
 */
export function useHubProfile() {
  const { data: profile, isLoading, error } = useCurrentUserFullProfile()
  const setAttributes = useGameStore((state) => state.setAttributes)

  useEffect(() => {
    if (!profile) return

    const mappedAttributes = mapProfileToAttributes(profile)
    if (mappedAttributes) {
      setAttributes(mappedAttributes)
    }
  }, [profile, setAttributes])

  return {
    isLoading,
    error,
  }
}

