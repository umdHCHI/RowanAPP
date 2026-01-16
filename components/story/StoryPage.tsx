import React, { useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useStoryEngine } from '@/hooks/use-story-engine'
import { useStoryMusic } from '@/utils/useStoryMusic'
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
import { getJournalEntryRewardFromPassage, getMinigameRewardFromPassage, hasMinigameOption } from '@/utils/story-helpers'
import { journalService } from '@/api/services/journal.service'
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
  const { textSpeed, markJournalRewardCollected, hasCollectedJournalReward, addMemory } = useGameStore()

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
        if (!prompt) {
          console.warn(`[Reward Detection] Journal prompt ${reward.journalEntryId} not found, using fallback`)
        }
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

  // Handle choice selection (with sound - user interaction)
  const handleChoice = useCallback(
    async (choice: StoryChoice) => {
      haptics.mediumImpact()
      playPageFlipSound()
      
      // Check if this is the minigame choice
      if (choice.target_id === 'minigame' || choice.id === 'minigame-choice') {
        // Navigate to minigame instead of making a story choice
        addChoice(choice)
        router.push('/vantage')
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
          hasChoices={hasAnyChoices}
          storyId={storyId}
        />

        {/* Choice buttons at bottom - show even for endings if there are choices */}
        {hasAnyChoices && (
          <StoryChoices choices={allChoices} onChoicePress={handleChoice} />
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
    backgroundColor: 'transparent',
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

