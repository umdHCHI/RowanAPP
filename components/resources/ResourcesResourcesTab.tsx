import React, { useMemo } from 'react'
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { StoryInformationCard } from './StoryInformationCard'
import { JournalStatsCard } from './JournalStatsCard'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryResponse, UserFullProfileResponse, JournalEntryResponse } from '@/api/types'

interface ResourcesResourcesTabProps {
  resources: any[] // Keep for compatibility but not used
  storyId?: number
  profileData?: UserFullProfileResponse | null
  storiesData?: StoryResponse[] | null
  journalEntries?: JournalEntryResponse[]
}

export function ResourcesResourcesTab({ 
  storyId,
  profileData,
  storiesData,
  journalEntries = [],
}: ResourcesResourcesTabProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()

  // Get completed stories when no storyId is provided
  const completedStories = useMemo(() => {
    if (!storiesData || !profileData?.story_progress) return []
    
    // Filter for completed story progress entries
    const completedProgress = profileData.story_progress.filter(
      (progress) => progress.is_completed
    )
    
    // Match completed progress with full story data
    return completedProgress
      .map((progress) => {
        const story = storiesData.find((s) => s.id === progress.story)
        return story ? { story, progress } : null
      })
      .filter((item): item is { story: StoryResponse; progress: typeof profileData.story_progress[0] } => item !== null)
      .sort((a, b) => {
        // Sort by completed_at date (most recent first)
        const dateA = new Date(a.progress.completed_at).getTime()
        const dateB = new Date(b.progress.completed_at).getTime()
        return dateB - dateA
      })
  }, [storiesData, profileData])

  // Find the current story and its progress when storyId is provided
  const currentStoryWithProgress = useMemo(() => {
    if (!storiesData || !storyId || !profileData?.story_progress) return null
    
    const story = storiesData.find((s) => s.id === storyId) || null
    if (!story) return null
    
    const progress = profileData.story_progress.find((p) => p.story === storyId)
    
    return { story, progress }
  }, [storiesData, storyId, profileData])

  function handleViewOverview(storyId: number) {
    playPageFlipSound()
    router.push(`/story-overview?storyId=${storyId}`)
  }

  // If storyId is provided, show single story view
  if (storyId) {
    if (!currentStoryWithProgress) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Story not found</Text>
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
          />
          
          {/* View Full Overview Button */}
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => handleViewOverview(storyId)}
            activeOpacity={0.8}
          >
            <View style={styles.infoButtonContent}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#ffffff" />
              <Text style={styles.infoButtonText}>VIEW FULL STORY OVERVIEW</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>

          {/* Journal Stats Card */}
          <JournalStatsCard entries={journalEntries} />
        </View>
      </ScrollView>
    )
  }

  // If no storyId, show all completed stories
  if (completedStories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No completed stories yet</Text>
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
            <StoryInformationCard story={story} progress={progress} />
            
            {/* View Full Overview Button */}
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => handleViewOverview(story.id)}
              activeOpacity={0.8}
            >
              <View style={styles.infoButtonContent}>
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#ffffff" />
                <Text style={styles.infoButtonText}>VIEW FULL STORY OVERVIEW</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Journal Stats Card */}
        <JournalStatsCard entries={journalEntries} />
      </View>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resourcesListContainer: {
    gap: 24,
    alignItems: 'center',
  },
  storyCardWrapper: {
    width: '100%',
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  infoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  infoButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
})

