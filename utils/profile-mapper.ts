import type { LumenLevel } from '@/stores/game-store'
import type { UserFullProfileResponse } from '@/api/types'

/**
 * Map user profile to experience to lumens
 */
export function mapProfileToLumen(profile: UserFullProfileResponse): LumenLevel | null {
  if (!profile.character) return null

  const lumens = profile.character.experience ?? 0

  return {
    lumens: lumens,
  }
}
