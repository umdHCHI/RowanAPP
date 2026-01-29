import type { LumenLevel } from '@/stores/game-store'
import type { CharacterResponse, UserFullProfileResponse } from '@/api/types'

/**
 * Map user profile to experience to lumens
 */
export function mapProfileToLumen(character: CharacterResponse): LumenLevel | null {
  if (!character) return null

  const lumens = character.experience ?? 0

  return {
    lumens: lumens,
  }
}
