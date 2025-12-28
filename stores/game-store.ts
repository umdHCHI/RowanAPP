import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

// Attribute levels
export const AttributeLevelSchema = z.object({
  connection: z.number().min(1).max(5).default(1),
  courage: z.number().min(1).max(5).default(1),
  exploration: z.number().min(1).max(5).default(1),
  fear: z.number().min(1).max(5).default(1),
})

export type AttributeLevel = z.infer<typeof AttributeLevelSchema>

// Equipment types
export interface Equipment {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'helmet' | 'boots'
  imagePath: string
  unlocked: boolean
}

// Character data
export interface Character {
  id: string
  name: string
  avatar: string // Path to avatar image
  createdAt: number
}

// Story progression
export interface StoryState {
  currentChapter: number
  voidClarity: number // 0-100, represents how clear the void/library becomes
  visitedLocations: string[]
  completedChoices: Record<string, string>
}

// Journal progression
export interface JournalState {
  currentJournal: number
  voidClarity: number // 0-100, represents how clear the void/library becomes
  visitedLocations: string[]
  completedChoices: Record<string, string>
}

// Journal Prompt from API
export interface JournalPrompt {
  id: number
  prompt_id: string
  text: string
  category: string
  skill_category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  is_active: boolean
  order: number
  required_story_id: number | null
  required_passage_id: number | null
  personality_traits: string[]
  unlocked: boolean
  completed: boolean
  created_at: string
  updated_at: string
}

// Story data from API
export interface StoryData {
  id: number
  title: string
  description: string
  image: string | null
  starting_passage_id: string
  min_level: number
  category: string
  rarity: string
  revelations: string[]
  estimated_time_minutes: number
  atmosphere: string
  difficulty: string
  personality_focus: string[]
  is_repeatable: boolean
  created_at: string
  updated_at: string
  chapters: StoryChapterData[]
  chapter_count: number
  total_passages: number
}

export interface StoryChapterData {
  id: number
  title: string
  chapter_number: number
  is_starting_chapter: boolean
  story_title: string
  user_username: string
  passage_count: number
  created_at: string
}

interface GameState {
  // Character
  character: Character | null
  hasCreatedCharacter: boolean
  
  // Attributes
  attributes: AttributeLevel
  
  // Equipment
  equipment: Equipment[]
  
  // Story
  story: StoryState

  // Journal
  journal: JournalState
  journalPrompts: JournalPrompt[]
  
  // Stories from API
  stories: StoryData[]
  isLoadingStories: boolean
  
  // Settings
  soundMuted: boolean
  
  // Actions
  setCharacter: (character: Character) => void
  updateAttribute: (attr: keyof AttributeLevel, value: number) => void
  addEquipment: (equipment: Equipment) => void
  progressStory: (chapter: number, clarity?: number) => void
  progressJournal: (journalIndex: number, clarity?: number) => void
  makeChoice: (choiceId: string, choice: string, attributeChanges?: Partial<AttributeLevel>) => void
  setJournalPrompts: (prompts: JournalPrompt[]) => void
  setStories: (stories: StoryData[]) => void
  setLoadingStories: (loading: boolean) => void
  toggleSoundMute: () => void
  setAttributes: (attributes: AttributeLevel) => void
  resetGame: () => void
}

const defaultAttributes: AttributeLevel = {
  connection: 1,
  courage: 1,
  exploration: 1,
  fear: 1,
}

const defaultStory: StoryState = {
  currentChapter: 0,
  voidClarity: 0,
  visitedLocations: [],
  completedChoices: {},
}

const defaultJournal: JournalState = {
  currentJournal: 0,
  voidClarity: 0,
  visitedLocations: [],
  completedChoices: {},
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      character: null,
      hasCreatedCharacter: false,
      attributes: defaultAttributes,
      equipment: [],
      story: defaultStory,
      journal: defaultJournal,
      journalPrompts: [],
      stories: [],
      isLoadingStories: false,
      soundMuted: false,

      setCharacter: (character) =>
        set({ character, hasCreatedCharacter: true }),

      updateAttribute: (attr, delta) =>
        set((state) => {
          const currentValue = state.attributes[attr]
          const newValue = Math.max(1, Math.min(5, currentValue + delta))
          return {
            attributes: {
              ...state.attributes,
              [attr]: newValue,
            },
          }
        }),

      addEquipment: (equipment) =>
        set((state) => ({
          equipment: [...state.equipment, equipment],
        })),

      progressStory: (chapter, clarity) =>
        set((state) => ({
          story: {
            ...state.story,
            currentChapter: chapter,
            voidClarity: clarity ?? state.story.voidClarity,
          },
        })),

      progressJournal: (journalIndex, clarity) =>
        set((state) => ({
          journal: {
            ...state.journal,
            currentJournal: journalIndex,
            voidClarity: clarity ?? state.journal.voidClarity,
          },
        })),

      makeChoice: (choiceId, choice, attributeChanges) =>
        set((state) => {
          const newAttributes = attributeChanges
            ? Object.entries(attributeChanges).reduce(
                (acc, [key, value]) => {
                  const attrKey = key as keyof AttributeLevel
                  const currentValue = state.attributes[attrKey]
                  return {
                    ...acc,
                    [attrKey]: Math.max(1, Math.min(5, currentValue + (value ?? 0))),
                  }
                },
                { ...state.attributes }
              )
            : state.attributes

          return {
            attributes: newAttributes,
            story: {
              ...state.story,
              completedChoices: {
                ...state.story.completedChoices,
                [choiceId]: choice,
              },
            },
          }
        }),

      setJournalPrompts: (prompts) =>
        set({ journalPrompts: prompts }),

      setStories: (stories) =>
        set({ stories }),

      setLoadingStories: (loading) =>
        set({ isLoadingStories: loading }),

      toggleSoundMute: () =>
        set((state) => ({ soundMuted: !state.soundMuted })),

      setAttributes: (attributes) =>
        set(() => ({
          attributes,
        })),

      resetGame: () =>
        set({
          character: null,
          hasCreatedCharacter: false,
          attributes: defaultAttributes,
          equipment: [],
          story: defaultStory,
          journal: defaultJournal,
          journalPrompts: [],
          stories: [],
          isLoadingStories: false,
          soundMuted: false,
        }),
    }),
    {
      name: 'the-archive-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

