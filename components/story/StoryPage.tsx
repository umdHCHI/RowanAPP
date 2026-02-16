import React, { useCallback, useRef, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useStoryAutoAdvance, useStoryEngine, useStoryHistory } from '@/hooks'
import { useStoryMusic } from '@/utils/useStoryMusic'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useStoryStore } from '@/stores/story-store'
import { StoryBackground } from './StoryBackground'
import { StoryHeader } from './StoryHeader'
import { StoryContent } from './StoryContent'
import { StoryChoices } from './StoryChoices'
import { useGameStore } from '@/stores/game-store'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_LAYOUT } from './story-theme'

import { getJournalEntryRewardFromPassage, getMinigameRewardFromPassage, getExperienceRewardFromPassage, hasMinigameOption, hasMinigameTutorialFlag, buildStoryMinigameRoute } from '@/utils/story-helpers'
import { isExactContinueChoice, PROLOGUE_STORY_ID, getStudyDayFromCreatedAt } from '@/utils/story-constants'
import { EmaSurveyModal } from './EmaSurveyModal'
import type { EmaRequestPayload } from '@/types/ema'
import { journalService } from '@/api/services/journal.service'
import { storyService } from '@/api/services/story.service'
import { useGainLumens, useCurrentUserFullProfile, storyKeys } from '@/api'
import type { StoryChoice } from '@/types/story'
import { useStoryCompletionStore } from '@/stores/story-completion-store'

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
  const queryClient = useQueryClient()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const { textSpeed, markJournalRewardCollected, hasCollectedJournalReward, addMemory } = useGameStore()
  const gainLumens = useGainLumens()
  const markStoryCompleted = useStoryCompletionStore((state) => state.markStoryCompleted)

  const {
    isLoading,
    error,
    currentPassage,
    choices,
    isEnding,
    storyTitle,
    makeChoice: makeEngineChoice,
  } = useStoryEngine({ storyId, shouldRestart, textSpeed })

  // Track if route is focused (to prevent music playing when navigating away)
  const [isRouteFocused, setIsRouteFocused] = React.useState(true)
  
  // Track if story has been loaded at least once (to prevent music restarting on passage changes)
  const [storyHasLoaded, setStoryHasLoaded] = React.useState(false)
  
  // Track pause state for auto-advance
  const isPaused = useStoryStore((state) => state.isPaused)
  const setIsPaused = useStoryStore((state) => state.setPaused)
  // Brief "play" feedback when resuming: show play icon then hide overlay
  const [showResumeFeedback, setShowResumeFeedback] = React.useState(false)
  const resumeFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // EMA survey after story end: triggered when ending passage is detected (not Prologue)
  const [emaPayload, setEmaPayload] = React.useState<EmaRequestPayload | null>(null)
  const [showEndingWaitIndicator, setShowEndingWaitIndicator] = React.useState(false)
  const [shouldCompleteStory, setShouldCompleteStory] = React.useState(false)
  const completionTriggeredRef = useRef(false)
  const emaDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emaDelayElapsedRef = useRef(false)
  const emaPendingPayloadRef = useRef<EmaRequestPayload | null>(null)
  const storyCompletionIdRef = useRef<number | null>(null)
  const { data: userProfile } = useCurrentUserFullProfile()

  const togglePause = React.useCallback(() => {
    setIsPaused((prev) => {
      if (prev) {
        setShowResumeFeedback(true)
        return false
      }
      return true
    })
  }, [setIsPaused])

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
  
  // Reset story loaded state when storyId or restart intent changes
  React.useEffect(() => {
    setStoryHasLoaded(false)
    completionTriggeredRef.current = false
    emaDelayElapsedRef.current = false
    emaPendingPayloadRef.current = null
    if (emaDelayTimerRef.current) {
      clearTimeout(emaDelayTimerRef.current)
      emaDelayTimerRef.current = null
    }
    setEmaPayload(null)
    setShowEndingWaitIndicator(false)
    setShouldCompleteStory(false)
    setIsPaused(false)
  }, [storyId, shouldRestart, setIsPaused])

  // When ending passage is detected: complete story, then show EMA modal (study day from profile created_at)
  React.useEffect(() => {
    const isEndingPassage =
      currentPassage?.passage_type === 'ending' || isEnding
    const storyIdNum = Number(storyId)
    const isPrologueStory = storyIdNum === PROLOGUE_STORY_ID
    if (
      !isEndingPassage ||
      isLoading ||
      isPrologueStory ||
      completionTriggeredRef.current
    ) {
      return
    }
    completionTriggeredRef.current = true
    emaDelayElapsedRef.current = false
    setShowEndingWaitIndicator(true)
    if (emaDelayTimerRef.current) {
      clearTimeout(emaDelayTimerRef.current)
    }
    emaDelayTimerRef.current = setTimeout(() => {
      emaDelayElapsedRef.current = true
      setShowEndingWaitIndicator(false)
      if (emaPendingPayloadRef.current) {
        setEmaPayload(emaPendingPayloadRef.current)
        emaPendingPayloadRef.current = null
      }
    }, 4000)

    // Store storyId and trigger completion
    storyCompletionIdRef.current = storyIdNum
    setShouldCompleteStory(true)
  }, [currentPassage?.passage_type, isEnding, isLoading, storyId, choices.length])

  // Separate effect for actually calling completeStory to avoid dependency issues
  React.useEffect(() => {
    if (!shouldCompleteStory || storyCompletionIdRef.current === null) {
      return
    }

    const storyIdNum = storyCompletionIdRef.current

    storyService
      .completeStory(storyIdNum)
      .then((completeResponse) => {
        // Invalidate story progress so hub status updates to completed
        queryClient.invalidateQueries({ queryKey: storyKeys.progress() })
        queryClient.invalidateQueries({ queryKey: storyKeys.progressByStory(storyIdNum) })
        queryClient.invalidateQueries({ queryKey: storyKeys.progress(storyIdNum) })
        const c = completeResponse?.completion ?? completeResponse

        const storyCompletionId =
          typeof c?.story_completion_id === 'number'
            ? c.story_completion_id
            : undefined
        const isCompleted =
          c?.is_completed === true ||
          completeResponse?.story_completed === true ||
          completeResponse?.is_completed === true ||
          typeof storyCompletionId === 'number'
        if (isCompleted) {
          markStoryCompleted(storyIdNum)
        }
        const createdAt =
          userProfile?.date_joined ??
          userProfile?.created_at ??
          (userProfile as any)?.profile?.created_at
        const studyDay =
          (typeof c?.study_day === 'number' ? c.study_day : undefined) ?? getStudyDayFromCreatedAt(createdAt)

        // Show EMA for non-prologue stories on study days 1-5
        if (
          typeof storyCompletionId === 'number' &&
          studyDay >= 1 && studyDay <= 5
        ) {
          const payload = { storyCompletionId, studyDay }
          // Always show modal immediately if delay has elapsed or if not waiting
          if (emaDelayElapsedRef.current || !showEndingWaitIndicator) {
            setEmaPayload(payload)
            emaPendingPayloadRef.current = null
          } else {
            emaPendingPayloadRef.current = payload
          }
        }
        // Reset the trigger
        setShouldCompleteStory(false)
      })
      .catch((err) => {
        setShouldCompleteStory(false)
      })
  }, [shouldCompleteStory, queryClient, markStoryCompleted, userProfile, showEndingWaitIndicator])
  
  // Mark story as loaded once we have content (so music can start).
  // Keep storyHasLoaded true until we navigate away—do not reset on passage transitions (isLoading).
  // Include isRouteFocused so when we *continue* by navigating back, we re-evaluate.
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
      } catch {}

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
        minigameIsTutorial: reward.isTutorial,
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
      } catch {}

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
  }, [currentPassage, isLoading, addReward, gainLumens])

  // Handle choice selection (no sound here; sound/haptics only when user taps a choice button)
  const handleChoice = useCallback(
    async (choice: StoryChoice) => {

      // Check if this is the minigame choice
      if (choice.target_id === 'minigame' || choice.id === 'minigame-choice') {
        // Navigate to minigame instead of making a story choice
        const isTutorial = hasMinigameTutorialFlag(currentPassage)
        addChoice(choice)
        router.push(buildStoryMinigameRoute({ isTutorial, storyId }))
        return
      }
      
      if (!choice.target_id || choice.target_id.trim().length === 0) {
        return
      }

      addChoice(choice)
      
      // Check if this is a choice in an ending passage
      const isEndingChoice = isEnding || currentPassage?.passage_type === 'ending'
      const isPrologueStory = Number(storyId) === PROLOGUE_STORY_ID

      // Ending choice: advance narrative in background; navigate only if EMA modal is not showing
      if (isEndingChoice) {
        if (choice.target_id != null) {
          makeEngineChoice(choice).catch(() => null)
        }
        if (isPrologueStory && !emaPayload) {
          setTimeout(() => router.replace('/hub'), 300)
        }
        return
      }

      // For non-ending choices, process normally
      await makeEngineChoice(choice)
    },
    [makeEngineChoice, addChoice, isEnding, currentPassage, router, emaPayload, storyId]
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

  // Combine regular choices with minigame choice if available.
  // Skip adding minigame choice if:
  // - API already returned one (avoids duplication on reward passages)
  // - Current passage is mini_game type (already tappable like journal_entry)
  const allChoices = React.useMemo(() => {
    if (!hasMinigame) return choices
    // Don't add minigame choice for mini_game passage types (they're tappable cards)
    if (currentPassage?.passage_type === 'mini_game') return choices
    const hasMinigameChoice = choices.some(
      (c) => c.target_id === 'minigame' || c.id === 'minigame-choice'
    )
    if (hasMinigameChoice) return choices
    return [
      ...choices,
      {
        id: 'minigame-choice',
        text: 'Practice Thought Reframing',
        target_id: 'minigame',
      },
    ]
  }, [choices, hasMinigame, currentPassage?.passage_type])

  const hasAnyChoices = allChoices.length > 0
  const isSingleContinueOnly =
    allChoices.length === 1 && isExactContinueChoice(allChoices[0]?.text ?? '')
  const isMiniGamePassage = currentPassage?.passage_type === 'mini_game'

  const showChoicesStrip = hasAnyChoices && (!isSingleContinueOnly || isMiniGamePassage) && !isLoading


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
            hasChoices={showChoicesStrip}
            showEndingWaitIndicator={showEndingWaitIndicator}
            storyId={storyId}
          />
        </View>

        {/* Choice strip in layout flow: compact bar at bottom, above nav */}
        {showChoicesStrip && (
          <View style={styles.choicesStrip}>
            <StoryChoices choices={allChoices} onChoicePress={handleChoiceWithFeedback} />
          </View>
        )}

        {/* Pause overlay: non-blocking so history can scroll; tap button to toggle */}
        {showOverlay && (
          <View style={styles.pauseOverlay} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.pauseButtonWrapper}
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
          </View>
        )}

        {/* EMA survey after story end (study days 1–5, excluding Prologue) */}
        <EmaSurveyModal
          visible={emaPayload != null}
          payload={emaPayload}
          onClose={() => {
            setEmaPayload(null)
            router.replace('/hub')
          }}
          onSubmitted={() => {
            setEmaPayload(null)
            router.replace('/hub')
          }}
        />
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
    overflow: 'hidden',
    flexShrink: 0,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: STORY_COLORS.pauseOverlay,
    zIndex: STORY_LAYOUT.pauseOverlayZIndex,
    paddingTop: STORY_LAYOUT.mainContainerPaddingTop, // Account for header
  },
  pauseButtonWrapper: {
    position: 'absolute',
    top: STORY_LAYOUT.headerTop,
    right: STORY_SPACING.xl,
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

