import { useMemo } from 'react'
import { useUserFullProfile, useStories } from '@/api'
import type { StoryResponse } from '@/api/types'
import { useGameStore, type Power } from '@/stores/game-store'
import { buildAvatarConfig } from '@/utils/character-avatar-config'

const USER_ID = 1 // TODO: Get from auth context or store

export interface ResourceItem {
  id: string
  title: string
  type: string
  description?: string
  isLocked?: boolean
  duration?: string
  backgroundImage?: any
}

export interface MemoryItem {
  id: string
  title: string
  type: string
  description?: string
  modality?: 'write' | 'draw' | 'voice' | 'journal_reward'
  content?: string
  // Story progress fields
  storyId?: number
  storyCategory?: string
  progressPercentage?: number
  isCompleted?: boolean
  passagesVisitedCount?: number
  choicesMadeCount?: number
  startedAt?: string
  lastPlayed?: string
  completedAt?: string | null
  // Passage IDs to fetch and display
  passageIds?: string[]
}

export type TabType = 'powers' | 'resources' | 'memories'

/**
 * Format duration from estimated minutes
 */
function formatDuration(minutes: number | undefined): string | undefined {
  if (!minutes) return undefined
  if (minutes === 1) return '1 MIN READ'
  return `${minutes} MIN READ`
}

/**
 * Format story type from category and other fields
 */
function formatStoryType(story: StoryResponse): string {
  // Use category as base, uppercase it
  let type = story.category.toUpperCase()
  
  // Add additional type indicators if needed
  // You can customize this based on your needs
  if (story.difficulty) {
    type = `${type} | ${story.difficulty.toUpperCase()}`
  }
  
  return type
}

/**
 * Map StoryResponse to ResourceItem
 */
function mapStoryToResourceItem(story: StoryResponse, userLevel: number = 1): ResourceItem {
  return {
    id: story.id.toString(),
    title: story.title,
    type: formatStoryType(story),
    description: story.description || undefined,
    isLocked: userLevel < story.min_level,
    duration: formatDuration(story.estimated_time_minutes),
    backgroundImage: story.image ? { uri: story.image } : undefined,
  }
}




/**
 * Map wellness value to level (1-5) for image selection
 */
function mapValueToLevel(value: number): number {
  if (value <= 0) return 1
  const level = Math.round(value / 5)
  if (level < 1) return 1
  if (level > 5) return 5
  return level
}

/**
 * Hook for resources page data
 */
// Fallback powers list (locked)
const fallbackPowers: Power[] = [
  {
    id: 'power-grit',
    title: 'Grit',
    description: 'The resilience to persist through challenges.',
    isUnlocked: false,
    icon: 'shield-outline',
  },
  {
    id: 'power-stillness',
    title: 'Stillness',
    description: 'Finding calm in the midst of chaos.',
    isUnlocked: false,
    icon: 'leaf-outline',
  },
  {
    id: 'power-naming-the-storm',
    title: 'Naming the Storm',
    description: 'The power to recognize and name your emotions.',
    isUnlocked: false,
    icon: 'weather-lightning-outline',
  },
]

export function useResources() {
  const { data: profileData, isLoading: isLoadingProfile } = useUserFullProfile(USER_ID)
  const { data: storiesData, isLoading: isLoadingStories } = useStories()
  const storeMemories = useGameStore((state) => state.memories)
  const storePowers = useGameStore((state) => state.powers)
  const lastSeenPowerUnlockAt = useGameStore((state) => state.lastSeenPowerUnlockAt)
  const markPowersSeen = useGameStore((state) => state.markPowersSeen)

  // Get user level from profile (default to 1 if not available)
  const userLevel = useMemo(() => {
    // TODO: Extract actual level from profileData when available
    // For now, defaulting to 1 (all stories with min_level > 1 will be locked)
    return profileData?.character?.level || 1
  }, [profileData])

  // Map stories to ResourceItem format
  const resources = useMemo(() => {
    if (!storiesData) return []
    return storiesData.map((story) => mapStoryToResourceItem(story, userLevel))
  }, [storiesData, userLevel])

  // Transform story progress into memory items
  const storyProgressMemories = useMemo(() => {
    if (!profileData?.story_progress) return []
    
    return profileData.story_progress.map((progress) => {
      const statusText = progress.is_completed 
        ? 'Completed' 
        : `${Math.round(progress.progress_percentage)}% Complete`
      
      const description = progress.is_completed
        ? `You completed this ${progress.story_category} story.`
        : `You've explored ${progress.passages_visited_count} passages and made ${progress.choices_made_count} choices.`
      
      // Select 1-2 passages to display: first and last (or just first if only one)
      const passageIds = progress.passages_visited || []
      const selectedPassageIds: string[] = []
      if (passageIds.length > 0) {
        selectedPassageIds.push(passageIds[0]) // First passage
        if (passageIds.length > 1) {
          // Add the last passage if there's more than one
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
      } as MemoryItem
    }).sort((a, b) => {
      // Sort by last played (most recent first), then by started date
      const aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0
      const bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0
      if (aTime !== bTime) return bTime - aTime
      
      const aStarted = a.startedAt ? new Date(a.startedAt).getTime() : 0
      const bStarted = b.startedAt ? new Date(b.startedAt).getTime() : 0
      return bStarted - aStarted
    })
  }, [profileData])

  // Combine story progress memories with stored memories and mock memories
  const memories = useMemo(() => {
    const storeMemoryIds = new Set(storeMemories.map((m) => m.id))
    const storyProgressIds = new Set(storyProgressMemories.map((m) => m.id))
    
    
    // Convert store Memory format to MemoryItem format
    const storeMemoryItems: MemoryItem[] = storeMemories.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      description: m.description,
      modality: m.modality,
      content: m.content,
    }))
    
    // Combine: story progress first (most recent), then store memories, then mock
    return [...storyProgressMemories, ...storeMemoryItems]
  }, [storeMemories, storyProgressMemories])
  
  const isLoading = isLoadingProfile || isLoadingStories

  const attributes = useMemo(() => {
    return profileData?.character?.wellness_stats || []
  }, [profileData])

  const equippedGear = useMemo(() => {
    return profileData?.character?.equipped_gear || []
  }, [profileData])

  const characterName = useMemo(() => {
    return profileData?.character?.name || 'Seeker'
  }, [profileData])

  const avatarConfig = useMemo(() => {
    if (!profileData?.character) return null
    return buildAvatarConfig(profileData.character)
  }, [profileData])

  const experience = useMemo(() => {
    return profileData?.character?.experience || 0
  }, [profileData])

  // Extract resource counts from character profile
  const resourceCounts = useMemo(() => {
    if (!profileData?.character) return null
    
    return {
      awareness: profileData.character.awareness || 0,
      resilience: profileData.character.resilience || 0,
      connection: profileData.character.connection || 0,
      balance: profileData.character.balance || 0,
      memoriesExplored: profileData.character.memories_explored || 0,
      copingSkillsLearned: profileData.character.coping_skills_learned || 0,
      insightsDiscovered: profileData.character.insights_discovered || 0,
    }
  }, [profileData])

  // Compute powers for UI with isNew field
  const powersForUi = useMemo((): Array<Power & { isNew?: boolean }> => {
    // Use store powers if available, otherwise fallback
    const powers = storePowers.length > 0 ? storePowers : fallbackPowers

    // Sort: unlocked first (most recently unlocked first), then locked
    const sorted = [...powers].sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1
      if (!a.isUnlocked && b.isUnlocked) return 1
      if (a.isUnlocked && b.isUnlocked) {
        const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
        const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
        return bTime - aTime // Most recent first
      }
      return 0
    })

    // Add isNew field
    return sorted.map((power) => {
      const isNew: boolean =
        power.isUnlocked === true &&
        !!power.unlockedAt &&
        (!lastSeenPowerUnlockAt || new Date(power.unlockedAt) > new Date(lastSeenPowerUnlockAt))

      return {
        ...power,
        isNew: isNew || undefined,
      }
    })
  }, [storePowers, lastSeenPowerUnlockAt])

  return {
    isLoading,
    resources,
    memories,
    attributes,
    equippedGear,
    characterName,
    avatarConfig,
    character: profileData?.character,
    powers: powersForUi,
    markPowersSeen,
    experience,
    resourceCounts,
  }
}

