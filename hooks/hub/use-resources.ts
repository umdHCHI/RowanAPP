import { useEffect, useMemo, useState } from 'react'
import { useCurrentUserFullProfile, useStories, useJournalEntries, useMyCharacter } from '@/api'
import { storyService } from '@/api/services/story.service'
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
  const { data: myCharacter } = useMyCharacter()
  const { isLoading: isLoadingHubProfile } = useHubProfile()
  const { data: storiesData, isLoading: isLoadingStories } = useStories()
  const { data: journalEntriesData, isLoading: isLoadingJournal } = useJournalEntries(1, 100)
  const [storyProgressData, setStoryProgressData] = useState<StoryProgressItem[]>([])

  const storeMemories = useGameStore((state) => state.memories)
  const storePowers = useGameStore((state) => state.powers)
  const lastSeenPowerUnlockAt = useGameStore((state) => state.lastSeenPowerUnlockAt)
  const markPowersSeen = useGameStore((state) => state.markPowersSeen)
  const lumens = useGameStore((state) => state.lumens.lumens)

  const userLevel = useMemo(
    () => profileData?.profile?.character?.level ?? 1,
    [profileData?.profile?.character?.level]
  )

  const resources = useMemo(
    () => mapStoriesToResourceItems(storiesData ?? [], userLevel),
    [storiesData, userLevel]
  )

  const storyProgressMemories = useMemo(() => {
    const progress = storyProgressData.length
      ? storyProgressData
      : (profileData?.story_progress as StoryProgressItem[] | undefined)
    if (!progress?.length) return []
    return mapStoryProgressToMemoryItems(progress)
  }, [profileData?.story_progress, storyProgressData])

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
    () => profileData?.profile?.character?.name ?? 'Seeker',
    [profileData?.profile?.character?.name]
  )

  const avatarConfig = useMemo(() => {
    const profileConfig = profileData?.profile?.character?.customization
      ? buildAvatarConfig(profileData.profile.character.customization)
      : null
    if (profileConfig) return profileConfig
    return myCharacter ? buildAvatarConfig(myCharacter) : null
  }, [profileData?.profile?.character, myCharacter])

  const resourceCounts = useMemo(
    () => profileData?.profile?.character?.memories_explored ?? 0,
    [profileData?.profile?.character?.memories_explored]
  )

  const isLoading =
    isLoadingProfile || isLoadingHubProfile || isLoadingStories || isLoadingJournal

  useEffect(() => {
    if (!profileData) return

    const run = async () => {
      try {
        const response = await storyService.getProgress()
        const data = (response as any)?.data
        const progressList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : null
        if (Array.isArray(progressList)) {
          setStoryProgressData(progressList as StoryProgressItem[])
        }
      } catch (error: any) {
        void error
      }
    }

    run()
  }, [profileData])

  return {
    isLoading,
    resources,
    memories,
    characterName,
    avatarConfig,
    character: profileData?.profile?.character ?? undefined,
    powers: powersForUi,
    markPowersSeen,
    experience: lumens,
    resourceCounts,
    profileData,
    storiesData,
    journalEntries: journalEntriesArray,
    storyProgress: storyProgressData,
  }
}
