// Hub-specific types

export type CardStatus = 'locked' | 'available' | 'completed'

export interface StoryCard {
  id: string
  label: string
  title: string
  subtitle: string
  tagline: string
  chapterId: number
  status: CardStatus
  hasResources: boolean
  backgroundImage?: any // require() image
  revelations?: string[]
}

