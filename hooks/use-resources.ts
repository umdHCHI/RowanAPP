import { useMemo } from 'react'
import { useUserFullProfile, useStories } from '@/api'
import { COLORS, type Color } from '@/utils/character-assets'
import type { StoryResponse } from '@/api/types'

const USER_ID = 3 // TODO: Get from auth context or store

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
 * Mock memories data - replace with actual API data later
 */
const mockMemories: MemoryItem[] = [
  {
    id: 'm1',
    title: 'DREAM I REFLECTIONS',
    type: 'REFLECTION',
    description: 'LOG YOUR THOUGHTS',
  },
  {
    id: 'm2',
    title: "WHERE YOU'RE HEADED",
    type: 'GOAL',
    description: 'A calmer mind.',
  },
  {
    id: 'm3',
    title: 'ONE SMALL ACTION TO TAKE WHILE ON THIS PATH',
    type: 'ACTION',
    description: 'Check in with yourself and be more responsive to your needs.',
  },
  {
    id: 'm4',
    title: 'DREAM I VISION',
    type: 'VISION',
    description: "You saw an enormous tree, far away, its top lost in the clouds.",
  },
]

/**
 * Map color indices to Color type
 */
function getColorByIndex(index: number | undefined): Color {
  if (index === undefined || index === null) return 'Brown'
  const colorIndex = Math.max(0, Math.min(index, COLORS.length - 1))
  return COLORS[colorIndex] || 'Brown'
}

/**
 * Build avatar config from character data
 */
function buildAvatarConfig(character: any): string | null {
  if (!character) return null
  
  const config = character.character_config || character
  
  const avatarConfig = {
    baseIndex: (config.selected_base_model || 1) - 1,
    backgroundColor: getColorByIndex(config.selected_background_color),
    backgroundIndex: (config.selected_background_type || 1) - 1,
    hairColor: getColorByIndex(config.selected_hair_color),
    hairIndex: (config.selected_hair_style || 1) - 1,
    clothesColor: getColorByIndex(config.selected_shirt_color),
    clothesIndex: (config.selected_shirt_type || 1) - 1,
    eyesColor: getColorByIndex(config.selected_eye_color),
    eyesIndex: (config.selected_eye_type || 1) - 1,
    eyebrowsColor: getColorByIndex(config.selected_eyebrow_color),
    eyebrowsIndex: (config.selected_eyebrow_style || 1) - 1,
    mouthIndex: (config.selected_mouth_type || 1) - 1,
  }

  return JSON.stringify(avatarConfig)
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
export function useResources() {
  const { data: profileData, isLoading: isLoadingProfile } = useUserFullProfile(USER_ID)
  const { data: storiesData, isLoading: isLoadingStories } = useStories()

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

  const memories = useMemo(() => mockMemories, [])
  
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

  return {
    isLoading,
    resources,
    memories,
    attributes,
    equippedGear,
    characterName,
    avatarConfig,
    character: profileData?.character,
  }
}

