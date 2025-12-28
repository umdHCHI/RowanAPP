import { useEffect } from 'react'
import { useUserFullProfile } from '@/api/hooks/use-user'
import { useGameStore } from '@/stores/game-store'
import { mapProfileToAttributes } from '@/utils/profile-mapper'

const USER_ID = 3 // TODO: Get from auth context or store

/**
 * Load user profile and map to attributes in the game store
 */
export function useHubProfile() {
  const { data: profile, isLoading, error } = useUserFullProfile(USER_ID)
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

