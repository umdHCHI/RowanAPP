import type { LumenLevel } from '@/stores/game-store'
import type { CharacterResponse, UserFullProfileResponse } from '@/api/types'

/**
 * Map user profile to experience to lumens
 */
function isFullProfile(profile: CharacterResponse | UserFullProfileResponse): profile is UserFullProfileResponse {
  return (
    'profile' in profile ||
    'story_progress' in profile
  )
}

export function mapProfileToLumen(profile: CharacterResponse | UserFullProfileResponse): LumenLevel | null {
  if (!profile) return null

  const character = isFullProfile(profile) ? profile.profile?.character : profile
  if (!character) return null

  const lumens = character.experience ?? 0

  return {
    lumens: lumens,
  }
}
