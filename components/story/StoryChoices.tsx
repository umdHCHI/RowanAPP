import React from 'react'
import { View, Text as RNText, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { StoryChoice } from '@/types/story'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS, STORY_LAYOUT } from './story-theme'

interface StoryChoicesProps {
  choices: StoryChoice[]
  onChoicePress: (choice: StoryChoice) => void
}

export function StoryChoices({ choices, onChoicePress }: StoryChoicesProps) {
  const insets = useSafeAreaInsets()
  const screenHeight = Dimensions.get('window').height
  
  // Filter out empty target ids
  const visibleChoices = choices.filter((choice) => choice.target_id?.trim().length > 0)

  if (visibleChoices.length === 0) {
    return null
  }

  // Calculate max height: up to 50% of screen height, with a minimum
  const maxContainerHeight = Math.max(
    STORY_LAYOUT.choicesContainerMinHeight,
    screenHeight * STORY_LAYOUT.choicesContainerMaxHeightPercent
  )

  return (
    <View style={[styles.choicesContainer, { 
      paddingBottom: Math.max(insets.bottom, STORY_SPACING.lg),
      maxHeight: maxContainerHeight,
    }]}>
      {/* Blur background to allow video to show through */}
      <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="dark" />
      {/* Semi-transparent overlay for better contrast */}
      <View style={styles.overlay} />
      
      <ScrollView
        style={styles.choicesScrollView}
        contentContainerStyle={styles.choicesScrollContent}
        showsVerticalScrollIndicator={true}
        bounces={false}
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
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  choicesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: STORY_SPACING.md,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: STORY_COLORS.headerBorder,
    overflow: 'hidden',
    // maxHeight is set dynamically based on screen size
    // paddingBottom is set dynamically based on safe area insets
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  choicesScrollView: {
    flex: 1,
  },
  choicesScrollContent: {
    paddingHorizontal: STORY_SPACING.xxl,
    paddingBottom: STORY_SPACING.xs,
  },
  choiceButton: {
    backgroundColor: STORY_COLORS.button,
    borderRadius: STORY_BORDER_RADIUS.md,
    paddingVertical: STORY_SPACING.lg,
    paddingHorizontal: STORY_SPACING.xxl,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: STORY_SPACING.sm,
  },
  choiceText: {
    fontFamily: STORY_FONTS.fontTitleWhite,
    fontSize: STORY_FONT_SIZES.base,
    color: STORY_COLORS.text,
    textAlign: 'center',
  },
})

