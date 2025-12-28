import React, { useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useStoryEngine } from '@/hooks/use-story-engine'
import { useIntroductionStoryMusic } from '@/utils/useIntroductionStoryMusic'
import { useStoryHistory } from '@/hooks/use-story-history'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { StoryBackground } from './StoryBackground'
import { StoryHeader } from './StoryHeader'
import { StoryContent } from './StoryContent'
import { StoryChoices } from './StoryChoices'
import { useGameStore } from '@/stores/game-store'
import { useStoryAutoAdvance } from '@/hooks/use-story-auto-advance'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_LAYOUT } from './story-theme'
import type { StoryChoice } from '@/types/story'

interface StoryPageProps {
  storyId: string | number
  chapterId?: number
  isIntroduction?: boolean
  isActive?: boolean
}

export function StoryPage({ storyId, chapterId, isIntroduction = false, isActive = true }: StoryPageProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const { textSpeed } = useGameStore()

  const {
    isLoading,
    error,
    currentPassage,
    choices,
    isEnding,
    hasChoices,
    chapterTitle,
    makeChoice: makeEngineChoice,
  } = useStoryEngine({ storyId, chapterId })

  // Track if route is focused (to prevent music playing when navigating away)
  const [isRouteFocused, setIsRouteFocused] = React.useState(true)
  
  // Track if story has been loaded at least once (to prevent music restarting on passage changes)
  const [storyHasLoaded, setStoryHasLoaded] = React.useState(false)
  
  // Track pause state for auto-advance
  const [isPaused, setIsPaused] = React.useState(false)
  
  const togglePause = React.useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])
  
  // Monitor route focus
  useFocusEffect(
    useCallback(() => {
      setIsRouteFocused(true)
      return () => {
        setIsRouteFocused(false)
        // Reset story loaded state when navigating away to ensure music stops
        setStoryHasLoaded(false)
      }
    }, [])
  )
  
  // Reset story loaded state when storyId changes (switching stories)
  React.useEffect(() => {
    setStoryHasLoaded(false)
  }, [storyId])
  
  // Mark story as loaded once we have content
  React.useEffect(() => {
    if (!isLoading && !!currentPassage && !error) {
      setStoryHasLoaded(true)
    }
  }, [isLoading, currentPassage, error])

  // Play background music for introduction story (looping, 50% volume)
  // Only play when route is focused, story is active (visible), has loaded, and it's the introduction story
  // Use storyHasLoaded instead of currentPassage to prevent restarting on passage changes
  const isStoryActive = isRouteFocused && isActive && storyHasLoaded && isIntroduction
  useIntroductionStoryMusic(isStoryActive)

  // Manage story history
  const { history, addChoice } = useStoryHistory({ currentPassage })

  // Handle choice selection (with sound - user interaction)
  const handleChoice = useCallback(
    async (choice: StoryChoice) => {
      haptics.mediumImpact()
      playPageFlipSound()
      addChoice(choice)
      
      // Check if this is a choice in an ending passage
      const isEndingChoice = isEnding || currentPassage?.passage_type === 'ending'
      
      // If this is an ending choice, complete the story immediately and navigate
      // This handles cases where target_id is null or undefined (no next passage)
      if (isEndingChoice) {
        // Try to process the choice in the background (for API tracking)
        // But don't wait for it if target_id is null/undefined (story completion)
        if (choice.target_id != null) {
          makeEngineChoice(choice).catch(() => {
            // Ignore errors - we're navigating away anyway
          })
        }
        
        // Small delay to ensure choice is recorded, then navigate to hub
        // The hub will show the next available story card
        setTimeout(() => {
          router.replace('/hub')
        }, 300)
        return
      }
      
      // For non-ending choices, process normally
      await makeEngineChoice(choice)
    },
    [makeEngineChoice, playPageFlipSound, haptics, addChoice, isEnding, currentPassage, router]
  )

  // Handle auto-advance (without sound - automatic)
  const handleAutoAdvance = useCallback(
    async (choice: StoryChoice) => {
      // No sound or haptics for auto-advance
      addChoice(choice)
      await makeEngineChoice(choice)
    },
    [makeEngineChoice, addChoice]
  )

  // Auto-advance "Continue" choices (without sound)
  useStoryAutoAdvance({
    hasChoices,
    isLoading,
    currentPassage,
    choices,
    textSpeed,
    isPaused,
    onAutoAdvance: handleAutoAdvance,
  })

  // Check if current passage is ending type
  const hasEndingPassage =
    currentPassage?.passage_type === 'ending' ||
    isEnding ||
    history.some((item) => item.passageType === 'ending')

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StoryBackground isEnding={hasEndingPassage} isIntroduction={isIntroduction} storyId={storyId} />
      <StoryHeader isPaused={isPaused} onTogglePause={togglePause} />

      <View style={styles.mainContainer}>
        <StoryContent
          chapterTitle={chapterTitle}
          history={history}
          currentPassage={currentPassage}
          error={error}
          isLoading={isLoading}
          isEnding={isEnding}
          hasChoices={hasChoices}
          storyId={storyId}
        />

        {/* Choice buttons at bottom - show even for endings if there are choices */}
        {hasChoices && (
          <StoryChoices choices={choices} onChoicePress={handleChoice} />
        )}

        {/* Pause overlay - big button when paused */}
        {isPaused && (
          <TouchableOpacity
            style={styles.pauseOverlay}
            onPress={togglePause}
            activeOpacity={0.9}
          >
            <View style={styles.pauseButtonContainer}>
              <MaterialCommunityIcons 
                name="play" 
                size={80} 
                color="#ffffff" 
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B4E',
  },
  mainContainer: {
    flex: 1,
    paddingTop: STORY_LAYOUT.mainContainerPaddingTop,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: STORY_COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: STORY_LAYOUT.pauseOverlayZIndex,
    paddingTop: STORY_LAYOUT.mainContainerPaddingTop, // Account for header
  },
  pauseButtonContainer: {
    width: STORY_LAYOUT.pauseButtonSize,
    height: STORY_LAYOUT.pauseButtonSize,
    borderRadius: STORY_BORDER_RADIUS.full,
    backgroundColor: STORY_COLORS.pauseButton,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: STORY_SPACING.xs,
    borderColor: STORY_COLORS.pauseBorder,
  },
})

