import React from 'react'
import { View, Text as RNText, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StoryPassage } from './StoryPassage'
import { StoryRewardMoment } from './StoryRewardMoment'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useMyCharacter } from '@/api'
import { buildAvatarConfig } from '@/utils/character-avatar-config'
import { getStoryImageUrl, normalizeSpeakerName } from '@/utils/story-helpers'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS } from './story-theme'
import type { StoryHistoryItem } from '@/types/story'

interface StoryHistoryProps {
  history: StoryHistoryItem[]
}

export function StoryHistory({ history }: StoryHistoryProps) {
  const router = useRouter()
  const { data: myCharacter } = useMyCharacter()
  const avatarConfig = React.useMemo(() => buildAvatarConfig(myCharacter), [myCharacter])
  
  function handleRewardPress(journalEntryId?: string) {
    if (journalEntryId) {
      router.push(`/journal?promptId=${journalEntryId}&from=story`)
    } else {
      router.push('/journal?from=story')
    }
  }

  function handleMinigamePress() {
    router.push('/vantage')
  }

  function getRewardType(type?: string): 'JOURNAL_REWARD' | 'MINIGAME' | 'POWER' | 'ITEM' | 'ACTION_SCENE' | 'LUMENS' {
    if (type === 'journal_entry') return 'JOURNAL_REWARD'
    if (type === 'minigame') return 'MINIGAME'
    if (type === 'power' || type === 'skill') return 'POWER'
    if (type === 'action_scene') return 'ACTION_SCENE'
    if (type === 'lumens') return 'LUMENS'
    return 'ITEM'
  }
  
  return (
    <>
      {history.map((item, index) => {
        // Render action passages as rewards
        const isActionPassage = item.type === 'passage' && item.passageType === 'action'
        
        if (isActionPassage) {
          const actionImageUrl = getStoryImageUrl(item.speakerImage)
          const normalizedSpeakerName = normalizeSpeakerName(item.speakerName)
          return (
            <View key={`${item.type}-${item.id}-${index}`} style={styles.historyItem}>
              <StoryRewardMoment
                type="ACTION_SCENE"
                title={item.content || 'Action Scene'}
                subtitle={normalizedSpeakerName || undefined}
                imageSource={actionImageUrl ? { uri: actionImageUrl } : undefined}
              />
            </View>
          )
        }
        
        return (
          <View key={`${item.type}-${item.id}-${index}`} style={styles.historyItem}>
            {item.type === 'passage' ? (
              <StoryPassage 
                content={item.content} 
                passageType={item.passageType} 
                speakerName={item.speakerName}
                speakerImage={item.speakerImage}
                playerAvatarConfig={avatarConfig}
                playerAvatarSize={48}
              />
            ) : item.type === 'reward' ? (
            <StoryRewardMoment
              type={getRewardType(item.rewardType)}
              title={item.rewardTitle || item.content || 'Reward Unlocked'}
              subtitle={item.rewardSubtitle}
              lumensAmount={item.lumensAmount}
              imageSource={item.rewardType === 'lumens' ? { uri: 'https://backend.131.212.41.8.nip.io/media/npc_portraits/lumen_golden.png' } : undefined}
              onPress={
                item.rewardType === 'journal_entry' 
                  ? () => handleRewardPress(item.journalEntryId)
                  : item.rewardType === 'minigame'
                  ? handleMinigamePress
                  : undefined
              }
            />
            ) : (
            <View style={styles.playerChoiceContainer}>
              <View style={styles.playerChoiceBubble}>
                <RNText style={styles.playerChoiceText}>{item.content}</RNText>
              </View>
              {avatarConfig && (
                <CharacterAvatar 
                  avatarConfig={avatarConfig} 
                  size={48} 
                />
              )}
            </View>
          )}
          </View>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  historyItem: {
    marginBottom: STORY_SPACING.lg,
  },
  playerChoiceContainer: {
    flexDirection: 'row',
    marginVertical: STORY_SPACING.sm,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: STORY_SPACING.md,
  },
  playerChoiceBubble: {
    backgroundColor: STORY_COLORS.playerChoiceBubble,
    borderRadius: STORY_BORDER_RADIUS.xl,
    paddingVertical: STORY_SPACING.md,
    paddingHorizontal: STORY_SPACING.lg,
    maxWidth: '80%',
    borderTopRightRadius: STORY_BORDER_RADIUS.sm,
  },
  playerChoiceText: {
    fontFamily: STORY_FONTS.fontTitleWhite,
    fontSize: STORY_FONT_SIZES.md,
    color: STORY_COLORS.text,
    textAlign: 'left',
  },
})

