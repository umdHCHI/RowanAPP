import type { LumenLevel } from '@/stores/game-store'
import type { CharacterResponse, UserFullProfileResponse } from '@/api/types'
import type { NotificationTime } from '@/types/hooks'

/**
 * Parse backend daily_reminder_time (e.g. "09:00", "09:30:00") to NotificationTime.
 * Returns default 9:00 if invalid or null.
 */
export function parseDailyReminderTime(
  value: string | null | undefined
): NotificationTime {
  if (value == null || typeof value !== 'string' || !value.trim()) {
    return { hour: 9, minute: 0 }
  }
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return { hour: 9, minute: 0 }
  const hour = Math.min(23, Math.max(0, parseInt(match[1], 10)))
  const minute = Math.min(59, Math.max(0, parseInt(match[2], 10)))
  return { hour, minute }
}

/**
 * Format NotificationTime to backend daily_reminder_time string (HH:mm).
 */
export function formatDailyReminderTime(time: NotificationTime): string {
  const h = String(time.hour).padStart(2, '0')
  const m = String(time.minute).padStart(2, '0')
  return `${h}:${m}`
}

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
