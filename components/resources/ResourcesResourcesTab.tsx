import React, { useMemo } from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { StoryInformationCard } from './StoryInformationCard'
import { JournalStatsCard } from './JournalStatsCard'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import type { ResourcesResourcesTabProps } from '@/types/resources/resources'
import type { StoryResponse } from '@/api/types'
import type { GameDataResponse } from '@/api'
import type { StoryProgressItem } from '@/utils/resources-mapper'
import { resourcesResourcesTabStyles as styles } from '@/styles/resources/resources-styles'

export function ResourcesResourcesTab({
  storyId,
  profileData,
  storiesData,
  journalEntries = [],
  storyProgress = [],
  gameData,
}: ResourcesResourcesTabProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()

  const npcSummaryByStoryId = useMemo(() => {
    const map = new Map<number, { count: number; npcName?: string }>()
    const storyData = (gameData as GameDataResponse | undefined)?.story_data
    const stories = Array.isArray(storyData?.stories) ? storyData?.stories : []

    stories.forEach((story) => {
      const storyIdValue = Number(story?.story_id)
      if (!Number.isFinite(storyIdValue)) return
      const npcs = Array.isArray(story?.npcs_talked_to) ? story.npcs_talked_to : []
      const topNpc = npcs.reduce<{ name?: string; count: number }>((current, npc) => {
        const count = typeof npc?.interaction_count === 'number' ? npc.interaction_count : 0
        if (count > current.count) {
          return { name: npc?.npc_name, count }
        }
        return current
      }, { name: undefined, count: 0 })

      map.set(storyIdValue, {
        count: topNpc.count,
        npcName: topNpc.name,
      })
    })

    return map
  }, [gameData])

  const completedStories = useMemo(() => {
    const progressList = storyProgress.length
      ? storyProgress
      : (profileData?.story_progress as StoryProgressItem[] | undefined)
    if (!storiesData || !progressList?.length) return []

    const completedProgress = progressList.filter((progress) => progress.is_completed)

    return completedProgress
      .map((progress) => {
        const story = storiesData.find((s) => s.id === progress.story)
        return story ? { story, progress } : null
      })
      .filter((item): item is { story: StoryResponse; progress: StoryProgressItem } => item !== null)
      .sort((a, b) => {
        const dateA = new Date(a.progress.completed_at ?? '').getTime()
        const dateB = new Date(b.progress.completed_at ?? '').getTime()
        return dateB - dateA
      })
  }, [storiesData, profileData, storyProgress])

  const currentStoryWithProgress = useMemo(() => {
    const progressList = storyProgress.length
      ? storyProgress
      : (profileData?.story_progress as StoryProgressItem[] | undefined)
    if (!storiesData || !storyId || !progressList?.length) return null

    const story = storiesData.find((s) => s.id === storyId) || null
    if (!story) return null

    const progress = progressList.find((p) => p.story === storyId)

    return { story, progress }
  }, [storiesData, storyId, profileData, storyProgress])

  function handleGoToHub() {
    playPageFlipSound()
    router.push('/hub')
  }

  if (storyId) {
    if (!currentStoryWithProgress) {
      return (
        <View style={styles.loadingContainer}>
          <Text variant="body" size={1} style={styles.loadingText}>Story not found</Text>
        </View>
      )
    }

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resourcesListContainer}>
          <StoryInformationCard
            story={currentStoryWithProgress.story}
            progress={currentStoryWithProgress.progress}
            npcInteractions={npcSummaryByStoryId.get(currentStoryWithProgress.story.id)?.count ?? 0}
            npcName={npcSummaryByStoryId.get(currentStoryWithProgress.story.id)?.npcName}
          />

          <Button
            fullWidth
            variant="secondary"
            onPress={handleGoToHub}
          >
            <View style={styles.infoButtonContent}>
              <MaterialDesignIcons name="book-open-page-variant" size={24} color="#ffffff" />
              <Text variant="label" style={styles.infoButtonText}>GO BACK TO STORY HUB PAGE</Text>
              <MaterialDesignIcons name="chevron-right" size={24} color="#ffffff" />
            </View>
          </Button>

          <JournalStatsCard entries={journalEntries} />
        </View>
      </ScrollView>
    )
  }

  if (completedStories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" size={1} style={styles.loadingText}>No completed stories yet</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.resourcesListContainer}>
        {completedStories.map(({ story, progress }) => (
          <View key={story.id} style={styles.storyCardWrapper}>
            <StoryInformationCard
              story={story}
              progress={progress}
              npcInteractions={npcSummaryByStoryId.get(story.id)?.count ?? 0}
              npcName={npcSummaryByStoryId.get(story.id)?.npcName}
            />

            <Button
              fullWidth
              variant="secondary"
              onPress={handleGoToHub}
            >
              <View style={styles.infoButtonContent}>
                <MaterialDesignIcons name="book-open-page-variant" size={24} color="#ffffff" />
                <Text variant="label" style={styles.infoButtonText}>GO BACK TO STORY HUB PAGE</Text>
                <MaterialDesignIcons name="chevron-right" size={24} color="#ffffff" />
              </View>
            </Button>
          </View>
        ))}

        <JournalStatsCard entries={journalEntries} />
      </View>
    </ScrollView>
  )
}
