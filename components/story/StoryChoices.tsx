import React from 'react'
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { StoryChoice } from '@/types/story'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS } from './story-theme'

interface StoryChoicesProps {
  choices: StoryChoice[]
  onChoicePress: (choice: StoryChoice) => void
}

export function StoryChoices({ choices, onChoicePress }: StoryChoicesProps) {
  const insets = useSafeAreaInsets()

  const visibleChoices = choices.filter((choice) => choice.target_id?.trim().length > 0)

  if (visibleChoices.length === 0) {
    return null
  }

  const horizontalPadding = Math.max(STORY_SPACING.xxxl, insets.left, insets.right)

  return (
    <View style={[styles.choicesContainer, {
      paddingBottom: insets.bottom,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
    }]}>
      {/* Blur background to allow video to show through */}
      <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="dark" />
      {/* Semi-transparent overlay for better contrast */}
      <View style={styles.overlay} />
      
      <View
        style={styles.choicesList}
      >
        {visibleChoices.map((choice) => (
          <TouchableOpacity
            key={String(choice.id)}
            style={styles.choiceButton}
            onPress={() => onChoicePress(choice)}
            activeOpacity={0.7}
          >
            <RNText style={styles.choiceText}>{choice.text}</RNText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  choicesContainer: {
    flexGrow: 0,
    paddingTop: STORY_SPACING.sm,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: STORY_COLORS.headerBorder,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  choicesList: {
    paddingBottom: STORY_SPACING.sm,
    paddingHorizontal: 0,
    justifyContent: 'flex-end',
  },
  choiceButton: {
    backgroundColor: STORY_COLORS.button,
    borderRadius: STORY_BORDER_RADIUS.md,
    paddingVertical: STORY_SPACING.md,
    paddingHorizontal: STORY_SPACING.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: STORY_SPACING.sm,
  },
  choiceText: {
    fontFamily: STORY_FONTS.fontTitleWhite,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.text,
    textAlign: 'center',
  },
})

