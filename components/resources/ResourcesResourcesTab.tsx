import React, { useMemo } from 'react'
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useStories } from '@/api'
import { StoryCard } from '@/components/hub/StoryCard'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard as StoryCardType } from '@/types/hub'
import type { StoryResponse } from '@/api/types'

interface ResourcesResourcesTabProps {
  resources: any[] // Keep for compatibility but not used
  storyId?: number
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.trim().length === 0) return text
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Map StoryResponse to StoryCard format
 */
function mapStoryToCard(story: StoryResponse, userLevel: number = 1): StoryCardType {
  // Determine status based on story data and user level
  let status: 'locked' | 'available' | 'completed' = 'available'
  if (story.min_level > userLevel) {
    status = 'locked'
  }

  // Check if story has chapters
  const hasResources = story.chapters && story.chapters.length > 0

  // Determine label based on category
  const isIntroduction = story.title.toLowerCase().includes('introduction')
  const label = story.category === 'main' 
    ? (isIntroduction ? 'INTRODUCTION' : `STORY ${story.id}`)
    : story.category.toUpperCase()

  return {
    id: `story-${story.id}`,
    label,
    title: truncateText(story.title, 50),
    subtitle: truncateText(story.atmosphere || 'THE ARCHIVE', 30),
    tagline: story.description || 'Your journey awaits',
    chapterId: story.id,
    status,
    hasResources,
    revelations: story.revelations || [],
  }
}

export function ResourcesResourcesTab({ storyId }: ResourcesResourcesTabProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const { data: storiesData, isLoading } = useStories()

  // Find the current story
  const currentStory = useMemo(() => {
    if (!storiesData || !storyId) return null
    return storiesData.find((story) => story.id === storyId) || null
  }, [storiesData, storyId])

  // Map story to StoryCard format
  const storyCard = useMemo(() => {
    if (!currentStory) return null
    // Default user level to 1 for now (can be enhanced later)
    return mapStoryToCard(currentStory, 1)
  }, [currentStory])

  function handleViewOverview() {
    playPageFlipSound()
    if (storyId) {
      router.push(`/story-overview?storyId=${storyId}`)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    )
  }

  if (!storyCard) {
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
        <StoryCard card={storyCard} />
        
        {/* Story Information Button */}
        {currentStory && (
          <TouchableOpacity
            style={styles.infoButton}
            onPress={handleViewOverview}
            activeOpacity={0.8}
          >
            <View style={styles.infoButtonContent}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#ffffff" />
              <Text style={styles.infoButtonText}>VIEW STORY OVERVIEW</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resourcesListContainer: {
    gap: 24,
    alignItems: 'center',
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

