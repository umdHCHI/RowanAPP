import type { AttributeLevel } from '@/stores/game-store'
import type { UserFullProfileResponse } from '@/api/types'

/**
 * Map wellness value to attribute level (1-5)
 */
export function mapWellnessValueToLevel(value: number): number {
  if (value <= 0) return 1
  const level = Math.round(value / 5)
  if (level < 1) return 1
  if (level > 5) return 5
  return level
}

/**
 * Map user profile to attribute levels
 */
export function mapProfileToAttributes(profile: UserFullProfileResponse): AttributeLevel | null {
  if (!profile.character) return null

  const stats = profile.character.wellness_stats
  if (!stats || !Array.isArray(stats)) return null

  const getStat = (label: string) =>
    stats.find((stat) => stat.label.toLowerCase() === label.toLowerCase())?.value ?? 0

  const explorationValue = getStat('Exploration')
  const courageValue = getStat('Courage')
  const connectionValue = getStat('Connection')
  const fearValue = getStat('Fear')

  return {
    connection: mapWellnessValueToLevel(connectionValue),
    courage: mapWellnessValueToLevel(courageValue),
    exploration: mapWellnessValueToLevel(explorationValue),
    fear: mapWellnessValueToLevel(fearValue),
  }
}

