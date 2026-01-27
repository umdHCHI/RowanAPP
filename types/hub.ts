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
  imageUrl?: string | null // Backend image URL
  revelations?: string[]
}


export interface ContentWarningModalProps {
  visible: boolean
  onClose: () => void
  title: string
  content?: string
  revelations?: string[]
}