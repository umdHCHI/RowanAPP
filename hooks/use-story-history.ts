import { useState, useEffect, useCallback } from 'react'
import type { StoryHistoryItem, StoryPassage } from '@/types/story'
import { isContinueChoice } from '@/utils/story-constants'

interface UseStoryHistoryProps {
  currentPassage: StoryPassage | null
}

export function useStoryHistory({ currentPassage }: UseStoryHistoryProps) {
  const [history, setHistory] = useState<StoryHistoryItem[]>([])

  // Add current passage to history when it changes
  useEffect(() => {
    if (currentPassage && currentPassage.content) {
      setHistory((prev) => {
        // Check if this passage is already in history
        const exists = prev.some(
          (item) => item.id === currentPassage.passage_id && item.type === 'passage'
        )
        if (!exists) {
          return [
            ...prev,
            {
              type: 'passage',
              content: currentPassage.content,
              id: currentPassage.passage_id,
              passageType: currentPassage.passage_type,
              speakerName: currentPassage.speaker_name,
              speakerImage: currentPassage.speaker_image,
            },
          ]
        }
        return prev
      })
    }
  }, [currentPassage?.passage_id, currentPassage?.content, currentPassage?.passage_type, currentPassage?.speaker_name, currentPassage?.speaker_image])

  const addChoice = useCallback((choice: { id: number | string; text: string }) => {
    // Add choice to history only if it's not a "Continue" choice
    if (!isContinueChoice(choice.text)) {
      setHistory((prev) => [
        ...prev,
        {
          type: 'choice',
          content: choice.text,
          id: String(choice.id),
        },
      ])
    }
  }, [])

  const addReward = useCallback((reward: { 
    id: string
    type: 'journal_entry' | 'minigame' | 'power' | 'skill' | 'gear' | 'lumens'
    title: string
    subtitle?: string
    journalEntryId?: string
    minigameLevel?: string
    lumensAmount?: number
  }) => {
    setHistory((prev) => [
      ...prev,
      {
        type: 'reward',
        content: reward.title,
        id: reward.id,
        rewardType: reward.type,
        rewardTitle: reward.title,
        rewardSubtitle: reward.subtitle,
        journalEntryId: reward.journalEntryId,
        minigameLevel: reward.minigameLevel,
        lumensAmount: reward.lumensAmount,
      },
    ])
  }, [])

  return { history, addChoice, addReward }
}

