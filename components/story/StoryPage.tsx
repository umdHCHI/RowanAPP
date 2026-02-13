import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useStoryAutoAdvance, useStoryEngine, useStoryHistory } from '@/hooks'
import { useStoryMusic } from '@/utils/useStoryMusic'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { StoryBackground } from './StoryBackground'
import { StoryHeader } from './StoryHeader'
import { StoryContent } from './StoryContent'
import { StoryChoices } from './StoryChoices'
import { useGameStore } from '@/stores/game-store'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_LAYOUT } from './story-theme'

const CHOICES_STRIP_HEIGHT = 240
import { getJournalEntryRewardFromPassage, getMinigameRewardFromPassage, getExperienceRewardFromPassage, hasMinigameOption } from '@/utils/story-helpers'
import { isExactContinueChoice } from '@/utils/story-constants'
import { journalService } from '@/api/services/journal.service'
import { useGainLumens } from '@/api'
import type { StoryChoice } from '@/types/story'

interface StoryPageProps {
  storyId: string | number
  isIntroduction?: boolean
  isActive?: boolean
  /** When true, story restarts from the beginning; when false, resumes from last saved passage. */
  shouldRestart?: boolean
}

export function StoryPage({
  storyId,
  isIntroduction = false,
  isActive = true,
  shouldRestart = false,
}: StoryPageProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const { textSpeed, markJournalRewardCollected, hasCollectedJournalReward, addMemory } = useGameStore()
  const gainLumens = useGainLumens()

  const {
    isLoading,
    error,
    currentPassage,
    choices,
    isEnding,
    hasChoices,
    storyTitle,
    makeChoice: makeEngineChoice,
  } = useStoryEngine({ storyId, shouldRestart })

  // Track if route is focused (to prevent music playing when navigating away)
  const [isRouteFocused, setIsRouteFocused] = React.useState(true)
  
  // Track if story has been loaded at least once (to prevent music restarting on passage changes)
  const [storyHasLoaded, setStoryHasLoaded] = React.useState(false)
  
  // Track pause state for auto-advance
  const [isPaused, setIsPaused] = React.useState(false)
  // Brief "play" feedback when resuming: show play icon then hide overlay
  const [showResumeFeedback, setShowResumeFeedback] = React.useState(false)
  const resumeFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const togglePause = React.useCallback(() => {
    setIsPaused((prev) => {
      if (prev) {
        setShowResumeFeedback(true)
        return false
      }
      return true
    })
  }, [])

  const handleTogglePause = useCallback(() => {
    togglePause()
  }, [togglePause])

  // Clear resume feedback after short delay so play icon disappears
  useEffect(() => {
    if (!showResumeFeedback) return
    resumeFeedbackTimerRef.current = setTimeout(() => {
      setShowResumeFeedback(false)
      resumeFeedbackTimerRef.current = null
    }, 500)
    return () => {
      if (resumeFeedbackTimerRef.current) {
        clearTimeout(resumeFeedbackTimerRef.current)
      }
    }
  }, [showResumeFeedback])
  
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
  
  // Mark story as loaded once we have content (so music can start).
  // Include isRouteFocused so when we *continue* by navigating back to this screen, we re-evaluate
  // and set storyHasLoaded true again (deps didn't change while away, so effect wouldn't run otherwise).
  React.useEffect(() => {
    if (!isLoading && !!currentPassage && !error) {
      setStoryHasLoaded(true)
    }
  }, [isLoading, currentPassage, error, isRouteFocused])

  // Play background music for story (looping, 50% volume)
  // Only play when route is focused, story is active (visible), and has loaded
  // Use storyHasLoaded instead of currentPassage to prevent restarting on passage changes
  // Pass storyId to determine which music to play (music will only play if configured for that story)
  const isStoryActive = isRouteFocused && isActive && storyHasLoaded
  useStoryMusic(storyId, isStoryActive)

  // Manage story history - must be defined before reward collection effect
  const { history, addChoice, addReward } = useStoryHistory({ currentPassage })

  // Track rewards shown in this session to avoid duplicates in history
  const rewardsShownThisSession = React.useRef<Set<string>>(new Set())

  // Collect journal rewards when passage changes
  React.useEffect(() => {
    if (!currentPassage || isLoading) return

    // Store passage in const so TypeScript knows it's not null inside async function
    const passage = currentPassage

    async function collectJournalReward() {
      const reward = getJournalEntryRewardFromPassage(passage)
      if (!reward) {
        return
      }

      // Check if already collected globally
      const wasAlreadyCollected = hasCollectedJournalReward(reward.journalEntryId)
      
      // Check if we've shown this reward in history this session
      const rewardKey = `${passage.passage_id}-${reward.journalEntryId}`
      const shownThisSession = rewardsShownThisSession.current.has(rewardKey)

      if (wasAlreadyCollected && shownThisSession) {
        return
      }

      // Mark as collected globally (if not already)
      if (!wasAlreadyCollected) {
        markJournalRewardCollected(reward.journalEntryId)
      }

      // Mark as shown this session
      rewardsShownThisSession.current.add(rewardKey)

      // Fetch prompt details
      let prompt = null
      try {
        prompt = await journalService.getJournalPromptById(reward.journalEntryId)
      } catch (error) {
        console.error('[Reward Detection] Failed to fetch journal prompt:', error)
      }

      // Add reward to story history (even if prompt fetch failed)
      const rewardTitle = prompt?.skill_category || 'Journal Prompt Unlocked'
      const rewardSubtitle = prompt?.text?.trim().substring(0, 120) || undefined
      
      addReward({
        id: `journal-reward-${reward.journalEntryId}-${passage.passage_id}`,
        type: 'journal_entry',
        title: rewardTitle,
        subtitle: rewardSubtitle,
        journalEntryId: reward.journalEntryId,
      })

      // Create memory entry (only if not already collected and prompt was found)
      if (!wasAlreadyCollected && prompt) {
        const memory = {
          id: `journal-reward-${reward.journalEntryId}`,
          type: 'JOURNAL_REWARD',
          title: rewardTitle,
          description: prompt.text.substring(0, 140).trim(),
          modality: 'journal_reward' as const,
          content: JSON.stringify({ journalEntryId: reward.journalEntryId, prompt }),
          createdAt: new Date().toISOString(),
        }

        addMemory(memory)
      }
    }

    collectJournalReward()
  }, [currentPassage, isLoading, hasCollectedJournalReward, markJournalRewardCollected, addMemory, addReward])

  // Collect minigame rewards when passage changes
  React.useEffect(() => {
    if (!currentPassage || isLoading) return

    // Store passage in const so TypeScript knows it's not null inside async function
    const passage = currentPassage

    function collectMinigameReward() {
      const reward = getMinigameRewardFromPassage(passage)
      if (!reward) {
        return
      }

      // Check if we've shown this reward in history this session
      const rewardKey = `${passage.passage_id}-minigame-${reward.level}`
      const shownThisSession = rewardsShownThisSession.current.has(rewardKey)

      if (shownThisSession) {
        return
      }

      // Mark as shown this session
      rewardsShownThisSession.current.add(rewardKey)

      // Determine title based on level
      const levelTitles: Record<string, string> = {
        levelOne: 'Thought Defender - Level One',
        levelTwo: 'Thought Defender - Level Two',
        levelThree: 'Thought Defender - Level Three',
      }
      const rewardTitle = levelTitles[reward.level] || `Thought Defender - ${reward.level}`
      const rewardSubtitle = 'Practice reframing negative thoughts in this interactive challenge'

      // Add reward to story history
      addReward({
        id: `minigame-reward-${reward.level}-${passage.passage_id}`,
        type: 'minigame',
        title: rewardTitle,
        subtitle: rewardSubtitle,
        minigameLevel: reward.level,
      })
    }

    collectMinigameReward()
  }, [currentPassage, isLoading, addReward])

  // Collect experience/lumens rewards when passage changes
  React.useEffect(() => {
    if (!currentPassage || isLoading) return

    // Store passage in const so TypeScript knows it's not null inside async function
    const passage = currentPassage

    async function collectExperienceReward() {
      const reward = getExperienceRewardFromPassage(passage)
      if (!reward) {
        return
      }

      // Log for debugging - experience reward detected
      // Check if we've shown this reward in history this session
      const rewardKey = `${passage.passage_id}-lumens-${reward.amount}`
      const shownThisSession = rewardsShownThisSession.current.has(rewardKey)

      if (shownThisSession) {
        return
      }

      // Mark as shown this session
      rewardsShownThisSession.current.add(rewardKey)

      // Award experience to the backend
      try {
        await gainLumens.mutateAsync(reward.amount)
      } catch (error) {
        // Log error but don't block the reward display
        console.error('Failed to award experience:', error)
      }

      // Add reward to story history
      addReward({
        id: `lumens-reward-${reward.amount}-${passage.passage_id}`,
        type: 'lumens',
        title: `${reward.amount} Lumens Earned`,
        subtitle: 'Light gathered from your journey',
        lumensAmount: reward.amount,
      })
    }

    collectExperienceReward()
  }, [currentPassage, isLoading, addReward])

  // Handle choice selection (no sound here; sound/haptics only when user taps a choice button)
  const handleChoice = useCallback(
    async (choice: StoryChoice) => {
      // Check if this is the minigame choice
      if (choice.target_id === 'minigame' || choice.id === 'minigame-choice') {
        // Navigate to minigame instead of making a story choice
        // Pass tutorial=true to start at level 0 (tutorial level)
        addChoice(choice)
        router.push('/vantage?tutorial=true')
        return
      }
      
      if (!choice.target_id || choice.target_id.trim().length === 0) {
        return
      }

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
    [makeEngineChoice, addChoice, isEnding, currentPassage, router]
  )

  // Only play page-flip sound and haptics when user explicitly taps a choice (not on auto-advance)
  const handleChoiceWithFeedback = useCallback(
    (choice: StoryChoice) => {
      haptics.mediumImpact()
      playPageFlipSound()
      handleChoice(choice)
    },
    [handleChoice, haptics, playPageFlipSound]
  )

  // Check if current passage has minigame option enabled
  const hasMinigame = currentPassage ? hasMinigameOption(currentPassage) : false

  // Create minigame choice if enabled
  const minigameChoice: StoryChoice | null = hasMinigame
    ? {
        id: 'minigame-choice',
        text: 'Practice Thought Reframing',
        target_id: 'minigame', // Special target_id to identify minigame choice
      }
    : null

  // Combine regular choices with minigame choice if available
  const allChoices = React.useMemo(() => {
    if (minigameChoice) {
      return [...choices, minigameChoice]
    }
    return choices
  }, [choices, minigameChoice])

  const hasAnyChoices = allChoices.length > 0
  const hasMultipleChoices = allChoices.length > 1
  const isSingleContinueOnly =
    allChoices.length === 1 && isExactContinueChoice(allChoices[0]?.text ?? '')

  const showChoicesStrip = hasAnyChoices && !isSingleContinueOnly

  useStoryAutoAdvance({
    hasChoices: hasAnyChoices,
    isLoading,
    currentPassage,
    choices: allChoices,
    textSpeed,
    isPaused,
    onAutoAdvance: handleChoice,
  })

  // Check if current passage is ending type
  const hasEndingPassage =
    currentPassage?.passage_type === 'ending' ||
    isEnding ||
    history.some((item) => item.passageType === 'ending')

  const showOverlay = isPaused || showResumeFeedback

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StoryBackground isEnding={hasEndingPassage} isIntroduction={isIntroduction} storyId={storyId} />
      <StoryHeader isPaused={isPaused} onTogglePause={togglePause} />

      <View style={styles.mainContainer}>
        <View style={styles.scrollArea}>
          <StoryContent
            storyTitle={storyTitle}
            history={history}
            currentPassage={currentPassage}
            error={error}
            isLoading={isLoading}
            isEnding={isEnding}
            hasChoices={hasAnyChoices && !isSingleContinueOnly}
            storyId={storyId}
          />
        </View>

        {/* Choice strip in layout flow: compact bar at bottom, above nav */}
        {showChoicesStrip && (
          <View style={styles.choicesStrip}>
            <StoryChoices choices={allChoices} onChoicePress={handleChoiceWithFeedback} />
          </View>
        )}

        {/* Pause overlay: pause icon when paused, play icon briefly when resuming; tap to toggle */}
        {showOverlay && (
          <TouchableOpacity
            style={styles.pauseOverlay}
            onPress={handleTogglePause}
            activeOpacity={0.9}
          >
            <View style={styles.pauseButtonContainer}>
              <MaterialDesignIcons
                name={isPaused ? 'pause' : 'play'}
                size={STORY_LAYOUT.pauseIconSize}
                color="#ffffff"
                style={{ opacity: 0.9 }}
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
    backgroundColor: '#000000',
  },
  mainContainer: {
    flex: 1,
    paddingTop: STORY_LAYOUT.mainContainerPaddingTop,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
  },
  choicesStrip: {
    width: '100%',
    height: CHOICES_STRIP_HEIGHT,
    overflow: 'hidden',
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

