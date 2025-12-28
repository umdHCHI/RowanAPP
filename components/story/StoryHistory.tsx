import React from 'react'
import { View, Text as RNText, StyleSheet } from 'react-native'
import { StoryPassage } from './StoryPassage'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import { useGameStore } from '@/stores/game-store'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS, STORY_LAYOUT } from './story-theme'
import type { StoryHistoryItem } from '@/types/story'

interface StoryHistoryProps {
  history: StoryHistoryItem[]
}

export function StoryHistory({ history }: StoryHistoryProps) {
  const { character } = useGameStore()
  
  return (
    <>
      {history.map((item, index) => (
        <View key={`${item.type}-${item.id}-${index}`} style={styles.historyItem}>
          {item.type === 'passage' ? (
            <StoryPassage 
              content={item.content} 
              passageType={item.passageType} 
              speakerName={item.speakerName}
              speakerImage={item.speakerImage}
            />
          ) : (
            <View style={styles.playerChoiceContainer}>
              <View style={styles.playerChoiceBubble}>
                <RNText style={styles.playerChoiceText}>{item.content}</RNText>
              </View>
              {character?.avatar && (
                <CharacterAvatar 
                  avatarConfig={character.avatar} 
                  size={48} 
                />
              )}
            </View>
          )}
        </View>
      ))}
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

