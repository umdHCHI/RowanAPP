import type React from 'react'
import type { AttributesResponse, JournalEntryResponse, StoryResponse, UserFullProfileResponse } from '@/api/types'
import type { StoryProgressItem } from '@/utils/resources-mapper'
import type { MemoryItem, NotificationTime } from '@/types/hooks'

// PowerCard
export interface PowerCardProps {
  id: string
  title: string
  description?: string
  subtitle?: string
  isUnlocked: boolean
  isNew?: boolean
  isActive?: boolean
  icon?: string | React.ReactNode
  onPress?: () => void
  powerLevel?: number | null
}

// PowerDetailsModal
export interface PowerDetailsModalProps {
  visible: boolean
  onClose: () => void
  title: string
  description?: string
  subtitle?: string
  icon?: string | React.ReactNode
  isActive?: boolean
}

// ResourcesResourcesTab
export interface ResourcesResourcesTabProps {
  resources: unknown[]
  storyId?: number
  profileData?: UserFullProfileResponse | null
  storiesData?: StoryResponse[] | null
  journalEntries?: JournalEntryResponse[]
  storyProgress?: StoryProgressItem[]
}

// ResourceItemCard
export type ResourceCardStatus = 'locked' | 'available' | 'completed'

export interface ResourceItemCardData {
  id: string
  title: string
  type: string
  status: ResourceCardStatus
  imageUrl?: string | null
  description?: string
}

export interface ResourceItemCardProps {
  card: ResourceItemCardData
  onResourcePress: () => void
}

// ResourcesPage
export type ResourcesTabType = 'settings' | 'resources' | 'memories'

export interface ResourcesPageProps {
  storyId?: number
}

// ResourcesMemoriesTab
export interface ResourcesMemoriesTabProps {
  memories: MemoryItem[]
  storyId?: number
}

export interface StoryPassageDisplayProps {
  storyId: number
  passageId: string
}

// JournalStatsCard
export interface JournalStatsCardProps {
  entries: JournalEntryResponse[]
}

// ResourcesSettingsTab
export interface ResourcesSettingsTabProps {
  profileData?: UserFullProfileResponse | null
  avatarConfig?: string | null
}

// StoryInformationCard
export interface StoryInformationCardProps {
  story: StoryResponse
  progress?: StoryProgressItem
}

// AttributesDisplay
export interface AttributeDisplayProps {
  showImages?: boolean
  attributes?: AttributesResponse
}
