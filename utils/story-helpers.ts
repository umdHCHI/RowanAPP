import { API_CONFIG } from '@/api/constants'
import type { StoryChoice } from '@/types/story'
import type { StoryData } from '@/stores/game-store'

/**
 * Get full image URL from a relative or absolute image path
 * Handles both absolute URLs and relative paths
 * Media files are typically served from the server root, not under /api/
 */
export function getStoryImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null

  // If it's already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If it's a relative path, construct full URL
  // Media files are served from server root, so extract base domain from API URL
  const apiBaseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api/ from end

  // Ensure path starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${serverBaseUrl}${cleanPath}`
}

/**
 * Normalize choices from API response to StoryChoice format
 * Handles various API response formats
 */
export function normalizeChoices(choices: any[]): StoryChoice[] {
  if (!Array.isArray(choices)) {
    return []
  }

  return choices.map((choice: any) => ({
    id: choice.id || choice.choice_id,
    text: choice.text || choice.choice_text || choice.label,
    target_id: choice.target_id || choice.target_passage_id || choice.target,
  }))
}

/**
 * Find the next available story after the current one
 */
export function findNextStory(
  stories: StoryData[],
  currentStoryId: string | number
): StoryData | null {
  if (!stories || stories.length === 0) return null

  const currentStoryIdNum = typeof currentStoryId === 'string' 
    ? parseInt(currentStoryId, 10) 
    : currentStoryId
  
  const currentIndex = stories.findIndex((story) => story.id === currentStoryIdNum)
  
  if (currentIndex === -1 || currentIndex === stories.length - 1) {
    return null
  }
  
  // Find the next available story (not locked by level requirement)
  // Filter out stories with personality_focus (those are not shown in hub)
  for (let i = currentIndex + 1; i < stories.length; i++) {
    const story = stories[i]
    // Check if story is available (min_level <= 1 means unlocked)
    // Also filter out stories with personality_focus (they're not in the main hub flow)
    const isAvailable = story.min_level <= 1
    const hasNoPersonalityFocus = !story.personality_focus || story.personality_focus.length === 0
    
    if (isAvailable && hasNoPersonalityFocus) {
      return story
    }
  }
  
  return null
}

/**
 * Journal Entry Reward type
 */
export type JournalEntryReward = {
  kind: 'journal_entry'
  journalEntryId: string
  sourcePassageId?: string
}

/**
 * Minigame Reward type
 */
export type MinigameReward = {
  kind: 'minigame'
  level: string
  sourcePassageId?: string
}

/**
 * Extract journal entry reward from a passage
 * Supports both story_effects (preferred) and effects (fallback)
 * Handles string form (journal prompt id) and object form (keyed by trait)
 */
export function getJournalEntryRewardFromPassage(passage: any, primaryTrait?: string): JournalEntryReward | null {
  const effects = passage?.story_effects && Object.keys(passage.story_effects).length > 0
    ? passage.story_effects
    : passage?.effects

  if (!effects) return null
  if (!effects.journal_entry) return null

  const je = effects.journal_entry
  // string form
  if (typeof je === 'string') {
    return { kind: 'journal_entry', journalEntryId: je, sourcePassageId: passage?.passage_id ?? passage?.id }
  }

  // object keyed by trait form
  if (je && typeof je === 'object' && !Array.isArray(je) && primaryTrait) {
    const key = primaryTrait.toLowerCase().trim()
    const id = je[key]
    if (typeof id === 'string') {
      return { kind: 'journal_entry', journalEntryId: id, sourcePassageId: passage?.passage_id ?? passage?.id }
    }
  }

  return null
}

/**
 * Extract minigame reward from a passage
 * Supports both story_effects (preferred) and effects (fallback)
 * Checks for minigame_levelOne or other minigame level keys
 */
export function getMinigameRewardFromPassage(passage: any): MinigameReward | null {
  const effects = passage?.story_effects && Object.keys(passage.story_effects).length > 0
    ? passage.story_effects
    : passage?.effects

  if (!effects) return null

  // Check for minigame_levelOne or other minigame level keys
  const minigameLevel = effects.minigame_levelOne || 
                        effects.minigame_levelTwo || 
                        effects.minigame_levelThree ||
                        effects.minigame_level

  if (!minigameLevel) return null

  // Determine the level from the key found
  let level = 'levelOne'
  if (effects.minigame_levelOne) level = 'levelOne'
  else if (effects.minigame_levelTwo) level = 'levelTwo'
  else if (effects.minigame_levelThree) level = 'levelThree'
  else if (effects.minigame_level) level = String(effects.minigame_level)

  return { 
    kind: 'minigame', 
    level, 
    sourcePassageId: passage?.passage_id ?? passage?.id 
  }
}