import React, { useRef, useEffect, useCallback } from 'react'
import { ScrollView, Text as RNText, View, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getStoryImageUrl, normalizeSpeakerName, hasMinigameTutorialFlag, buildStoryMinigameRoute } from '@/utils/story-helpers'
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
  showEndingWaitIndicator?: boolean
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
  showEndingWaitIndicator = false,
  storyId,
}: StoryContentProps) {
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()
  const [showJumpToBottom, setShowJumpToBottom] = React.useState(false)

  // Use full safe area so text stays clear of Android nav bar; add extra for comfort
  const bottomPadding = insets.bottom + STORY_SPACING.xxl
  const horizontalPadding = Math.max(STORY_SPACING.xxxl, insets.left, insets.right)

  // Track if user has manually scrolled away from bottom
  const isNearBottomRef = useRef(true)
  const previousHistoryLengthRef = useRef(history.length)
  
  // Track scroll position to detect if user is near bottom
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 200 // Consider "near bottom" if within 200px
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y
    const isNearBottom = distanceFromBottom < paddingToBottom
    if (isNearBottomRef.current !== isNearBottom) {
      isNearBottomRef.current = isNearBottom
      setShowJumpToBottom(!isNearBottom)
    }
  }
  
  // Auto-scroll to bottom when new content is added and user was near bottom.
  // Short delay so layout (new passage + current passage block) has updated before scrolling.
  const scrollToBottom = useCallback((animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated })
    isNearBottomRef.current = true
    setShowJumpToBottom(false)
  }, [])

  useEffect(() => {
    const historyLengthIncreased = history.length > previousHistoryLengthRef.current

    if (historyLengthIncreased) {
      if (isNearBottomRef.current) {
        const timeout = setTimeout(() => {
          scrollToBottom(true)
        }, 120)
        previousHistoryLengthRef.current = history.length
        return () => clearTimeout(timeout)
      }

      setShowJumpToBottom(true)
      previousHistoryLengthRef.current = history.length
    }
  }, [history.length, currentPassage?.passage_id, scrollToBottom])

  const lastPassageId = React.useMemo(() => {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const item = history[i]
      if (item.type === 'passage') return item.id
    }
    return null
  }, [history])


  function handleGoToHub() {
    router.replace('/hub')
  }

  return (
    <View style={styles.container}>
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
      <StoryHistory history={history} storyId={storyId} />

      {/* Current passage (show only if it isn't already the latest passage in history) */}
      {currentPassage && lastPassageId !== currentPassage.passage_id && (
        // Render action passages as rewards, other passages as tappable mini_game or normal display
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
        ) : currentPassage.passage_type === 'mini_game' ? (
          <StoryRewardMoment
            type="MINIGAME"
            title="Thought Defender"
            subtitle={currentPassage.content || 'Practice reframing negative thoughts in this interactive challenge'}
            theme={{
              primary: STORY_COLORS.minigameLabel,
              background: STORY_COLORS.minigameContainer,
              text: STORY_COLORS.minigameSubtext,
            }}
            onPress={() => {
              const isTutorial = hasMinigameTutorialFlag(currentPassage)
              router.push(buildStoryMinigameRoute({ isTutorial, storyId }))
            }}
          />
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

      {/* End of story: title label and navigation; only show buttons for Prologue (id 28) */}
      {isEnding && !hasChoices && !isLoading && (
        <View style={styles.endingSection}>
          {storyTitle && (
            <RNText style={styles.endingTitle}>End of {storyTitle}</RNText>
          )}
          {showEndingWaitIndicator && (
            <RNText style={styles.endingWaitText}>Please wait...</RNText>
          )}
          {Number(storyId) === PROLOGUE_STORY_ID && (
            <View style={styles.endingButtonsContainer}>
              <TouchableOpacity
                style={[styles.endingButton, styles.nextStoryButton]}
                onPress={handleGoToHub}
                activeOpacity={0.8}
              >
                <RNText style={styles.endingButtonText}>Go back to Hub</RNText>
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
        </View>
      )}
      </ScrollView>

      {showJumpToBottom && (
        <TouchableOpacity
          style={[styles.jumpButton, { bottom: insets.bottom + STORY_SPACING.lg }]}
          onPress={() => scrollToBottom(true)}
          activeOpacity={0.85}
        >
          <View style={styles.jumpButtonInner}>
            <MaterialDesignIcons name="arrow-down" size={20} color={STORY_COLORS.text} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  endingSection: {
    marginTop: STORY_SPACING.xxxl,
    width: '100%',
  },
  endingTitle: {
    fontFamily: STORY_FONTS.beyondWonderland,
    fontSize: STORY_FONT_SIZES.xxl,
    color: STORY_COLORS.text,
    textAlign: 'center',
    marginBottom: STORY_SPACING.xxl,
  },
  endingWaitText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: STORY_SPACING.xl,
    opacity: 0.85,
  },
  endingButtonsContainer: {
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
  jumpButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -26 }],
    zIndex: 5,
  },
  jumpButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: STORY_COLORS.headerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

