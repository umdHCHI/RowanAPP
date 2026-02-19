import React, { useMemo, useCallback } from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useRequireAuth } from '@/api'
import { StoryPage } from '@/components/story'
import { useHubStories } from '@/hooks'
import type { StoryData } from '@/stores/game-store'
import { PROLOGUE_STORY_ID } from '@/utils/story-constants'

/** Prologue is story 1 (ID 28); treat prologue/intro by id or title for background/music. */
function isIntroductionStory(story: StoryData): boolean {
  if (story.id === PROLOGUE_STORY_ID) return true
  const titleLower = String(story.title ?? '').toLowerCase()
  return titleLower.includes('prologue') || titleLower === 'prologue'
}

export default function Story() {
  useRequireAuth() // Redirects to login if not authenticated
  const params = useLocalSearchParams<{ storyId?: string; restart?: string }>()
  const { data: stories, isLoading } = useHubStories()

  // Find the story to display based on storyId parameter
  const currentStory = useMemo(() => {
    if (!stories || stories.length === 0 || !params.storyId) {
      return null
    }
    
    const storyId = parseInt(params.storyId, 10)
    return stories.find((story) => story.id === storyId) || null
  }, [stories, params.storyId])

  const isIntroduction = currentStory ? isIntroductionStory(currentStory) : false
  // Stop introduction music when navigating away from story route
  useFocusEffect(
    useCallback(() => {
      // Route is focused - music will be handled by StoryPage component
      return () => {
        // Route is unfocused - ensure all music stops
        // This cleanup runs when navigating away from the story route
      }
    }, [])
  )

  const shouldRestart = params.restart === 'true'

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <RNText style={styles.loadingText}>Loading stories...</RNText>
      </View>
    )
  }

  if (!currentStory) {
    return (
      <View style={styles.loadingContainer}>
        <RNText style={styles.loadingText}>Story not found</RNText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StoryPage 
        storyId={currentStory.id} 
        isIntroduction={isIntroduction}
        isActive={true}
        shouldRestart={shouldRestart}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8C5D1',
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#ffffff',
  },
})
