/**
 * Resources mapper – pure transformation functions for hub resources.
 * Follows story-mapper / profile-mapper patterns. No side effects.
 */

import type { StoryResponse, JournalEntryResponse } from '@/api/types'
import type { Memory, Power } from '@/stores/game-store'
import type { ResourceItem, MemoryItem } from '@/types/hooks'

// -----------------------------------------------------------------------------
// Story progress shape (from UserFullProfileResponse.story_progress)
// -----------------------------------------------------------------------------

export interface StoryProgressItem {
  id: number
  story: number
  story_title: string
  story_category: string
  progress_percentage: number
  is_completed: boolean
  passages_visited: string[]
  passages_visited_count: number
  choices_made_count: number
  choices_made?: Array<{
    choice_id?: string | null
    choice_text?: string | null
  }>
  started_at: string
  last_played: string
  completed_at: string | null
}

// -----------------------------------------------------------------------------
// Story → ResourceItem
// -----------------------------------------------------------------------------

export function formatDuration(minutes: number | undefined): string | undefined {
  if (!minutes) return undefined
  if (minutes === 1) return '1 MIN READ'
  return `${minutes} MIN READ`
}

export function formatStoryType(_story: StoryResponse): string {
  return 'STORY'
}

export function mapStoryToResourceItem(
  story: StoryResponse,
  userLevel: number = 1
): ResourceItem {
  return {
    id: story.id.toString(),
    title: story.title,
    type: formatStoryType(story),
    description: story.description || undefined,
    isLocked: userLevel < (story.min_level ?? 1),
    duration: formatDuration(story.estimated_time_minutes),
    backgroundImage: story.image ? { uri: story.image } : undefined,
  }
}

export function mapStoriesToResourceItems(
  stories: StoryResponse[],
  userLevel: number
): ResourceItem[] {
  if (!stories?.length) return []
  return stories.map((s) => mapStoryToResourceItem(s, userLevel))
}

// -----------------------------------------------------------------------------
// Journal entry → MemoryItem
// -----------------------------------------------------------------------------

export function mapEntryTypeToModality(
  entryType?: string | null
): 'journal' | 'draw' | 'voice' | 'journal_reward' {
  if (!entryType) return 'journal'
  const normalized = String(entryType ?? '').toLowerCase()
  if (normalized.includes('draw') || normalized.includes('drawing')) return 'draw'
  if (normalized.includes('voice') || normalized.includes('audio')) return 'voice'
  if (normalized.includes('reward')) return 'journal_reward'
  return 'journal'
}

export function mapJournalEntryToMemoryItem(entry: JournalEntryResponse): MemoryItem {
  return {
    id: `journal-entry-${entry.id}`,
    title: entry.prompt_text || 'Journal Entry',
    type: 'JOURNAL_ENTRY',
    description: entry.content_preview || undefined,
    modality: mapEntryTypeToModality(entry.entry_type),
    content: entry.content,
  }
}

export function mapJournalEntriesToMemoryItems(entries: JournalEntryResponse[]): MemoryItem[] {
  if (!entries?.length) return []
  const sorted = [...entries].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
  return sorted.map(mapJournalEntryToMemoryItem)
}

// -----------------------------------------------------------------------------
// Story progress → MemoryItem
// -----------------------------------------------------------------------------

export function mapStoryProgressToMemoryItem(progress: StoryProgressItem): MemoryItem {
  const statusText = progress.is_completed
    ? 'Completed'
    : `${Math.round(progress.progress_percentage)}% Complete`

  const description = progress.is_completed
    ? `You completed this ${progress.story_category} story.`
    : `You've explored ${progress.passages_visited_count} passages and made ${progress.choices_made_count} choices.`

  const passageIds = progress.passages_visited || []
  const selectedPassageIds: string[] = []
  if (passageIds.length > 0) {
    selectedPassageIds.push(passageIds[0])
    if (passageIds.length > 1) {
      selectedPassageIds.push(passageIds[passageIds.length - 1])
    }
  }

  return {
    id: `story-progress-${progress.id}`,
    title: progress.story_title,
    type: 'STORY_PROGRESS',
    description,
    storyId: progress.story,
    storyCategory: progress.story_category,
    progressPercentage: progress.progress_percentage,
    isCompleted: progress.is_completed,
    passagesVisitedCount: progress.passages_visited_count,
    choicesMadeCount: progress.choices_made_count,
    startedAt: progress.started_at,
    lastPlayed: progress.last_played,
    completedAt: progress.completed_at,
    passageIds: selectedPassageIds,
    content: JSON.stringify({
      status: statusText,
      progress: progress.progress_percentage,
    }),
  }
}

export function mapStoryProgressToMemoryItems(
  progressList: StoryProgressItem[]
): MemoryItem[] {
  if (!progressList?.length) return []
  const mapped = progressList.map(mapStoryProgressToMemoryItem)
  return mapped.sort((a, b) => {
    const aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0
    const bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0
    if (aTime !== bTime) return bTime - aTime
    const aStarted = a.startedAt ? new Date(a.startedAt).getTime() : 0
    const bStarted = b.startedAt ? new Date(b.startedAt).getTime() : 0
    return bStarted - aStarted
  })
}

// -----------------------------------------------------------------------------
// Store Memory → MemoryItem, combine memories
// -----------------------------------------------------------------------------

export function mapStoreMemoryToMemoryItem(m: Memory): MemoryItem {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    description: m.description,
    modality: m.modality,
    content: m.content,
  }
}

export function combineMemories(
  storeMemories: Memory[],
  storyProgressItems: MemoryItem[],
  journalItems: MemoryItem[]
): MemoryItem[] {
  const storeItems = storeMemories.map(mapStoreMemoryToMemoryItem)
  return [...storyProgressItems, ...journalItems, ...storeItems]
}

// -----------------------------------------------------------------------------
// Powers for UI (isNew)
// -----------------------------------------------------------------------------

export function mapPowersForUi(
  powers: Power[],
  lastSeenPowerUnlockAt?: string
): Array<Power & { isNew?: boolean }> {
  const sorted = [...powers].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1
    if (!a.isUnlocked && b.isUnlocked) return 1
    if (a.isUnlocked && b.isUnlocked) {
      const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
      const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
      return bTime - aTime
    }
    return 0
  })

  return sorted.map((power) => {
    const isNew =
      power.isUnlocked === true &&
      !!power.unlockedAt &&
      (!lastSeenPowerUnlockAt || new Date(power.unlockedAt) > new Date(lastSeenPowerUnlockAt))
    return {
      ...power,
      isNew: isNew || undefined,
    }
  })
}

// -----------------------------------------------------------------------------
// Journal API response → entries array
// -----------------------------------------------------------------------------

export function extractJournalEntriesArray(
  data: unknown
): JournalEntryResponse[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data !== 'object') return []
  const obj = data as Record<string, unknown>
  if ('data' in obj && Array.isArray(obj.data)) return obj.data as JournalEntryResponse[]
  if (
    'success' in obj &&
    'data' in obj &&
    Array.isArray((obj as { data: unknown[] }).data)
  ) {
    return (obj as { data: JournalEntryResponse[] }).data
  }
  return []
}
