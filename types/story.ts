/**
 * Story Passage Types
 */
export type PassageType = 'narration' | 'dialogue' | 'decision' | 'ending' | 'action'

/**
 * Story History Item - represents a passage, choice, or reward in the story history
 */
export interface StoryHistoryItem {
  type: 'passage' | 'choice' | 'reward'
  content: string
  id: string
  passageType?: PassageType
  speakerName?: string | null
  speakerImage?: string | null
  rewardType?: 'journal_entry' | 'minigame' | 'power' | 'skill' | 'gear' | 'lumens'
  rewardTitle?: string
  rewardSubtitle?: string
  journalEntryId?: string
  minigameLevel?: string
  lumensAmount?: number
}

/**
 * Story Passage - represents a passage from the API
 */
export interface StoryPassage {
  passage_id: string
  content: string
  passage_type?: PassageType
  speaker_name?: string | null
  speaker_image?: string | null
}

/**
 * Story Choice - represents a choice option
 */
export interface StoryChoice {
  id: number | string
  text: string
  target_id: string
}

/**
 * Legacy Story Card Config (kept for backwards compatibility)
 */
export interface StoryCardConfig {
  id: string
  label: string
  title: string
  subtitle: string
  tagline: string
  chapterId: number
}

/**
 * Legacy Story Choice (kept for backwards compatibility with old story system)
 */
export interface LegacyStoryChoice {
  id: string
  text: string
  attributeChanges?: {
    connection?: number
    courage?: number
    exploration?: number
    fear?: number
  }
  nextChapter?: number
}

/**
 * Legacy Story Dialogue (kept for backwards compatibility)
 */
export interface StoryDialogue {
  id: string
  speaker: 'curator' | 'narrator' | 'player'
  text: string
  curatorEmotion?: 'default' | 'excited' | 'talking' | 'tired' | 'winking' | 'stretch' | 'pawup'
}

/**
 * Legacy Story Chapter (kept for backwards compatibility)
 */
export interface StoryChapter {
  id: number
  title: string
  dialogues: StoryDialogue[]
  choices?: LegacyStoryChoice[]
  voidClarity: number // 0-100, affects visual clarity
  equipmentReward?: {
    id: string
    name: string
    type: 'weapon' | 'armor' | 'helmet' | 'boots'
    imagePath: string
  }
}

