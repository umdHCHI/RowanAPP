import React, { useRef, useEffect, useMemo } from 'react'
import { ScrollView, Text as RNText, View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHubStories } from '@/hooks'
import { findNextStory, getStoryImageUrl, normalizeSpeakerName } from '@/utils/story-helpers'
import { StoryHistory } from './StoryHistory'
import { StoryPassage } from './StoryPassage'
import { StoryRewardMoment } from './StoryRewardMoment'
import { STORY_COLORS, STORY_SPACING, STORY_FONT_SIZES, STORY_FONTS, STORY_BORDER_RADIUS } from './story-theme'
import { PROLOGUE_STORY_ID } from '@/utils/story-constants'
import type { StoryHistoryItem, StoryPassage as StoryPassageType } from '@/types/story'

interface StoryContentProps {
  storyTitle: string | null
  history: StoryHistoryItem[]
  currentPassage: StoryPassageType | null
  error: string | null
  isLoading: boolean
  isEnding: boolean
  hasChoices: boolean
  storyId?: string | number
}

export function StoryContent({
  storyTitle,
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
  const insets = useSafeAreaInsets()
  const { data: stories } = useHubStories()

  const insetPadding = Math.min(insets.bottom, STORY_SPACING.md)
  const bottomPadding = STORY_SPACING.xxl + insetPadding
  const horizontalPadding = Math.max(STORY_SPACING.xxxl, insets.left, insets.right)

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
  
  // Auto-scroll to bottom when new content is added and user was near bottom.
  // Short delay so layout (new passage + current passage block) has updated before scrolling.
  useEffect(() => {
    const historyLengthIncreased = history.length > previousHistoryLengthRef.current

    if (historyLengthIncreased && isNearBottomRef.current) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 120)
      previousHistoryLengthRef.current = history.length
      return () => clearTimeout(timeout)
    }
    if (historyLengthIncreased) {
      previousHistoryLengthRef.current = history.length
    }
  }, [history.length, currentPassage?.passage_id])

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

  function handleViewResources() {
    if (storyId) {
      router.push(`/resources?storyId=${storyId}`)
    } else {
      router.push('/resources')
    }
  }

  function handleNextStory() {
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
        { paddingBottom: bottomPadding, paddingHorizontal: horizontalPadding }
      ]}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      bounces={true}
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
      {/* Story Title */}
      {storyTitle && (
        <RNText style={styles.storyTitle}>{storyTitle}</RNText>
      )}

      {/* Story History */}
      <StoryHistory history={history} />

      {/* Current passage if not in history yet */}
      {currentPassage && !isCurrentPassageInHistory && (
        // Render action passages as rewards, other passages normally
        currentPassage.passage_type === 'action' ? (
          (() => {
            const imageUrl = getStoryImageUrl(currentPassage.speaker_image)
            const normalizedSpeakerName = normalizeSpeakerName(currentPassage.speaker_name)
            return (
              <StoryRewardMoment
                type="ACTION_SCENE"
                title={currentPassage.content || 'Action Scene'}
                subtitle={normalizedSpeakerName || undefined}
                imageSource={imageUrl ? { uri: imageUrl } : undefined}
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

      {/* When ending has choices (e.g. "Continue"), offer Restart this Book in content area */}
      {isEnding && hasChoices && storyId != null && !isLoading && (
        <View style={styles.restartLinkContainer}>
          <TouchableOpacity
            onPress={() => router.replace(`/story?storyId=${storyId}&restart=true`)}
            activeOpacity={0.8}
          >
            <RNText style={styles.restartLinkText}>Restart this Book</RNText>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation buttons at ending - Prologue (id 28) has no Resources button */}
      {isEnding && !hasChoices && !isLoading && (
        <View style={styles.endingButtonsContainer}>
          {Number(storyId) !== PROLOGUE_STORY_ID && (
            <TouchableOpacity
              style={[styles.endingButton, styles.archiveButton]}
              onPress={handleViewResources}
              activeOpacity={0.8}
            >
              <RNText style={styles.endingButtonText}>View Resources Gathered</RNText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.endingButton, styles.nextStoryButton]}
            onPress={handleNextStory}
            activeOpacity={0.8}
          >
            <RNText style={styles.endingButtonText}>
              {nextStory ? 'Continue to Next Story' : 'Return to Hub'}
            </RNText>
          </TouchableOpacity>
          {storyId != null && (
            <TouchableOpacity
              style={[styles.endingButton, styles.restartButton]}
              onPress={() => router.replace(`/story?storyId=${storyId}&restart=true`)}
              activeOpacity={0.8}
            >
              <RNText style={styles.endingButtonText}>Restart this Book</RNText>
            </TouchableOpacity>
          )}
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
    paddingTop: STORY_SPACING.xxl,
    // paddingBottom and paddingHorizontal set dynamically (safe area + minimum)
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
  restartButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: STORY_COLORS.buttonBorder,
  },
  restartLinkContainer: {
    marginTop: STORY_SPACING.xl,
    alignItems: 'center',
  },
  restartLinkText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.text,
    textDecorationLine: 'underline',
    opacity: 0.9,
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

