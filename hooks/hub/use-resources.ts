import { useMemo } from 'react'
import { useCurrentUserFullProfile, useStories, useJournalEntries } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import {
  mapStoriesToResourceItems,
  mapStoryProgressToMemoryItems,
  mapJournalEntriesToMemoryItems,
  combineMemories,
  mapPowersForUi,
  extractJournalEntriesArray,
} from '@/utils/resources-mapper'
import type { StoryProgressItem } from '@/utils/resources-mapper'
import { useHubProfile } from './use-hub-profile'
import type { UseResourcesResult } from '@/types/hooks'

/**
 * Hub resources hook. Fetches profile, stories, journal; reads game-store
 * (memories, powers, lumens); delegates transformation to utils/resources-mapper.
 */
export function useResources(): UseResourcesResult {
  const { data: profileData, isLoading: isLoadingProfile } = useCurrentUserFullProfile()
  const { isLoading: isLoadingHubProfile } = useHubProfile()
  const { data: storiesData, isLoading: isLoadingStories } = useStories()
  const { data: journalEntriesData, isLoading: isLoadingJournal } = useJournalEntries(1, 100)

  const storeMemories = useGameStore((state) => state.memories)
  const storePowers = useGameStore((state) => state.powers)
  const lastSeenPowerUnlockAt = useGameStore((state) => state.lastSeenPowerUnlockAt)
  const markPowersSeen = useGameStore((state) => state.markPowersSeen)
  const lumens = useGameStore((state) => state.lumens.lumens)

  const userLevel = useMemo(
    () => profileData?.character?.level ?? 1,
    [profileData?.character?.level]
  )

  const resources = useMemo(
    () => mapStoriesToResourceItems(storiesData ?? [], userLevel),
    [storiesData, userLevel]
  )

  const storyProgressMemories = useMemo(() => {
    const progress = profileData?.story_progress
    if (!progress?.length) return []
    return mapStoryProgressToMemoryItems(progress as StoryProgressItem[])
  }, [profileData?.story_progress])

  const journalEntriesArray = useMemo(
    () => extractJournalEntriesArray(journalEntriesData),
    [journalEntriesData]
  )

  const journalEntryMemories = useMemo(
    () => mapJournalEntriesToMemoryItems(journalEntriesArray),
    [journalEntriesArray]
  )

  const memories = useMemo(
    () => combineMemories(storeMemories, storyProgressMemories, journalEntryMemories),
    [storeMemories, storyProgressMemories, journalEntryMemories]
  )

  const powersForUi = useMemo(
    () => mapPowersForUi(storePowers, lastSeenPowerUnlockAt),
    [storePowers, lastSeenPowerUnlockAt]
  )

  const characterName = useMemo(
    () => profileData?.character?.name ?? 'Seeker',
    [profileData?.character?.name]
  )

  const avatarConfig = useMemo(
    () => (profileData?.character ? buildAvatarConfig(profileData.character) : null),
    [profileData?.character]
  )

  const resourceCounts = useMemo(
    () => profileData?.character?.memories_explored ?? 0,
    [profileData?.character?.memories_explored]
  )

  const isLoading =
    isLoadingProfile || isLoadingHubProfile || isLoadingStories || isLoadingJournal

  return {
    isLoading,
    resources,
    memories,
    characterName,
    avatarConfig,
    character: profileData?.character ?? undefined,
    powers: powersForUi,
    markPowersSeen,
    experience: lumens,
    resourceCounts,
    profileData,
    storiesData,
    journalEntries: journalEntriesArray,
  }
}
