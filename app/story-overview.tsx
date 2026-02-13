import React, { useMemo } from 'react'
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useStories, useRequireAuth } from '@/api'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import type { StoryResponse } from '@/api/types'

export default function StoryOverview() {
  useRequireAuth() // Redirects to login if not authenticated
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const params = useLocalSearchParams<{ storyId?: string }>()
  const storyId = params.storyId ? parseInt(params.storyId, 10) : undefined

  const { data: storiesData, isLoading } = useStories()

  // Find the current story
  const currentStory = useMemo(() => {
    if (!storiesData || !storyId) return null
    return storiesData.find((story) => story.id === storyId) || null
  }, [storiesData, storyId])

  function handleBack() {
    haptics.lightImpact()
    playPageFlipSound()
    router.back()
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading story...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!currentStory) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <MaterialDesignIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Story not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundGradient} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialDesignIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>STORY OVERVIEW</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StoryInformation story={currentStory} />
      </ScrollView>
    </SafeAreaView>
  )
}

/**
 * Story Information Component
 * Displays detailed information about the story
 */
function StoryInformation({ story }: { story: StoryResponse }) {
  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <View style={styles.infoContainer}>
      {/* Story Title */}
      <Text style={styles.storyTitle}>{story.title}</Text>
      
      {/* Description */}
      {story.description && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Description</Text>
          <Text style={styles.infoText}>{story.description}</Text>
        </View>
      )}

      {/* Story Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Estimated Time */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Estimated Time</Text>
          <Text style={styles.detailValue}>
            {formatDuration(story.estimated_time_minutes)}
          </Text>
        </View>

        {/* Rarity */}
        {story.rarity && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rarity</Text>
            <Text style={styles.detailValue}>{story.rarity.toUpperCase()}</Text>
          </View>
        )}

        {/* Passages */}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Passages</Text>
          <Text style={styles.detailValue}>
            {story.total_passages || story.passage_count || 0}
          </Text>
        </View>
      </View>

      {/* Atmosphere */}
      {story.atmosphere && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Atmosphere</Text>
          <Text style={styles.infoText}>{story.atmosphere}</Text>
        </View>
      )}

      {/* Revelations */}
      {story.revelations && story.revelations.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Revelations</Text>
          <View style={styles.revelationsContainer}>
            {story.revelations.map((revelation, index) => (
              <View key={index} style={styles.revelationItem}>
                <Text style={styles.revelationText}>• {revelation}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Repeatable */}
      {story.is_repeatable && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Repeatable</Text>
          <Text style={styles.infoText}>Yes - You can replay this story</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
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
  infoContainer: {
    width: '100%',
  },
  storyTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 42,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoText: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  revelationsContainer: {
    gap: 8,
  },
  revelationItem: {
    paddingLeft: 8,
  },
  revelationText: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
})

