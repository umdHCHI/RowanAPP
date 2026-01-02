import React, { useRef, useEffect, useMemo } from 'react'
import { ScrollView, Text as RNText, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useHubStories } from '@/hooks/use-hub-stories'
import { findNextStory } from '@/utils/story-helpers'
import { StoryHistory } from './StoryHistory'
import { StoryPassage } from './StoryPassage'
import { StoryRewardMoment } from './StoryRewardMoment'
import { getStoryImageUrl } from '@/utils/story-helpers'
import { STORY_COLORS, STORY_SPACING, STORY_FONT_SIZES, STORY_FONTS, STORY_BORDER_RADIUS, STORY_LAYOUT } from './story-theme'
import type { StoryHistoryItem, StoryPassage as StoryPassageType } from '@/types/story'

interface StoryContentProps {
  chapterTitle: string | null
  history: StoryHistoryItem[]
  currentPassage: StoryPassageType | null
  error: string | null
  isLoading: boolean
  isEnding: boolean
  hasChoices: boolean
  storyId?: string | number
}

export function StoryContent({
  chapterTitle,
  history,
  currentPassage,
  error,
  isLoading,
  isEnding,
  hasChoices,
  storyId,
}: StoryContentProps) {
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()
  const { data: stories } = useHubStories()
  const screenHeight = Dimensions.get('window').height
  
  // Calculate bottom padding to account for choice buttons
  // When choices are visible, we need to add padding equal to the choices container height
  // This will push the content up so it scrolls above the choices
  const choicesContainerHeight = hasChoices
    ? Math.max(
        STORY_LAYOUT.choicesContainerMinHeight,
        screenHeight * STORY_LAYOUT.choicesContainerMaxHeightPercent
      )
    : 0
  
  const bottomPadding = hasChoices
    ? choicesContainerHeight // Match the choices container height so content scrolls above it
    : STORY_SPACING.xxl // Standard padding when no buttons

  // Track if user has manually scrolled away from bottom
  const isNearBottomRef = useRef(true)
  const previousHistoryLengthRef = useRef(history.length)
  
  // Track scroll position to detect if user is near bottom
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 200 // Consider "near bottom" if within 200px
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y
    isNearBottomRef.current = distanceFromBottom < paddingToBottom
  }
  
  // Auto-scroll to bottom only if user is already near the bottom
  // This prevents interrupting users who are reading earlier parts of the history
  useEffect(() => {
    // Only auto-scroll if:
    // 1. History length increased (new content added)
    // 2. User was already near the bottom
    const historyLengthIncreased = history.length > previousHistoryLengthRef.current
    
    if (historyLengthIncreased && isNearBottomRef.current) {
      // Use a small delay to ensure the layout has updated with the new padding
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
      
      previousHistoryLengthRef.current = history.length
      return () => clearTimeout(timeout)
    } else if (historyLengthIncreased) {
      // Update ref even if we don't scroll
      previousHistoryLengthRef.current = history.length
    }
  }, [history.length, currentPassage, hasChoices])

  // Check if current passage is already in history
  const isCurrentPassageInHistory = currentPassage
    ? history.some(
        (item) => item.id === currentPassage.passage_id && item.type === 'passage'
      )
    : false

  // Find the next story after the current one
  const nextStory = useMemo(() => {
    if (!stories || !storyId) return null
    return findNextStory(stories, storyId)
  }, [stories, storyId])

  function handleViewArchive() {
    haptics.mediumImpact()
    playPageFlipSound()
    if (storyId) {
      router.push(`/resources?storyId=${storyId}`)
    } else {
      router.push('/resources')
    }
  }

  function handleNextStory() {
    haptics.mediumImpact()
    playPageFlipSound()
    
    if (nextStory) {
      router.push(`/story?storyId=${nextStory.id}`)
    } else {
      // No next story available, go to hub
      router.replace('/hub')
    }
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPadding }
      ]}
      showsVerticalScrollIndicator={false}
      bounces={true}
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
      {/* Story Title */}
      {chapterTitle && (
        <RNText style={styles.storyTitle}>{chapterTitle}</RNText>
      )}

      {/* Story History */}
      <StoryHistory history={history} />

      {/* Current passage if not in history yet */}
      {currentPassage && !isCurrentPassageInHistory && (
        // Render action passages as rewards, other passages normally
        currentPassage.passage_type === 'action' ? (
          (() => {
            const imageUrl = getStoryImageUrl(currentPassage.speaker_image)
            console.log('[StoryContent] Action scene - speaker_image:', currentPassage.speaker_image)
            console.log('[StoryContent] Action scene - imageUrl:', imageUrl)
            return (
              <StoryRewardMoment
                type="ACTION_SCENE"
                title={currentPassage.content || 'Action Scene'}
                subtitle={currentPassage.speaker_name || undefined}
                imageUrl={imageUrl}
              />
            )
          })()
        ) : (
          <StoryPassage
            content={currentPassage.content}
            passageType={currentPassage.passage_type}
            speakerName={currentPassage.speaker_name}
            speakerImage={currentPassage.speaker_image}
          />
        )
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <RNText style={styles.errorText}>{error}</RNText>
        </View>
      )}

      {/* Loading state */}
      {isLoading && (
        <RNText style={styles.loadingText}>Loading story...</RNText>
      )}

      {/* Navigation buttons at ending */}
      {isEnding && !hasChoices && !isLoading && (
        <View style={styles.endingButtonsContainer}>
          <TouchableOpacity
            style={[styles.endingButton, styles.archiveButton]}
            onPress={handleViewArchive}
            activeOpacity={0.8}
          >
            <RNText style={styles.endingButtonText}>View Your Archive</RNText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.endingButton, styles.nextStoryButton]}
            onPress={handleNextStory}
            activeOpacity={0.8}
          >
            <RNText style={styles.endingButtonText}>
              {nextStory ? 'Continue to Next Story' : 'Return to Hub'}
            </RNText>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: STORY_SPACING.xxl,
    paddingTop: STORY_SPACING.xxl,
    // paddingBottom is set dynamically based on whether buttons are visible
  },
  storyTitle: {
    fontFamily: STORY_FONTS.beyondWonderland,
    fontSize: STORY_FONT_SIZES.xxxl,
    color: STORY_COLORS.text,
    textAlign: 'center',
    marginBottom: STORY_SPACING.xxl,
    lineHeight: 48,
  },
  errorContainer: {
    backgroundColor: STORY_COLORS.errorContainer,
    padding: STORY_SPACING.lg,
    borderRadius: STORY_BORDER_RADIUS.md,
    marginBottom: STORY_SPACING.xxl,
  },
  errorText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.md,
    color: STORY_COLORS.text,
    textAlign: 'center',
  },
  loadingText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.md,
    color: STORY_COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: STORY_SPACING.xxl,
  },
  endingButtonsContainer: {
    marginTop: STORY_SPACING.xxxl,
    gap: STORY_SPACING.lg,
    width: '100%',
    paddingHorizontal: STORY_SPACING.sm,
  },
  endingButton: {
    borderRadius: STORY_BORDER_RADIUS.md,
    paddingVertical: STORY_SPACING.lg,
    paddingHorizontal: STORY_SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  archiveButton: {
    backgroundColor: STORY_COLORS.button,
  },
  nextStoryButton: {
    backgroundColor: STORY_COLORS.buttonSecondary,
    borderWidth: 2,
    borderColor: STORY_COLORS.buttonBorder,
  },
  endingButtonText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})

