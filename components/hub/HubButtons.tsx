import React from 'react'
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native'
import type { StoryCard } from '@/types/hub'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'

interface HubButtonsProps {
  card: StoryCard
  onPrimaryPress: () => void
  onResourcePress: () => void
  onNextPress: () => void
}

function getButtonText(card: StoryCard): string {
  if (card.id === 'intro') return 'Begin'
  if (card.status === 'locked') return 'Upgrade to continue now'
  if (card.status === 'completed') return 'Replay this book'
  return 'Explore this book'
}

export function HubButtons({ card, onPrimaryPress, onResourcePress, onNextPress }: HubButtonsProps) {
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const isIntroduction = card.title.toLowerCase().includes('introduction') || card.title.toLowerCase() === 'introduction'
  // Introduction should never show resource buttons
  const showResourceButtons = !isIntroduction && card.hasResources && card.status !== 'available'

  function handlePrimaryPress() {
    haptics.mediumImpact()
    playPageFlipSound()
    onPrimaryPress()
  }

  function handleResourcePress() {
    haptics.mediumImpact()
    playPageFlipSound()
    onResourcePress()
  }

  function handleNextPress() {
    haptics.mediumImpact()
    playPageFlipSound()
    onNextPress()
  }

  if (showResourceButtons && card.status === 'completed') {
    // Two button layout for completed cards
    return (
      <View style={styles.dualButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleResourcePress}
          style={styles.secondaryButton}
        >
          <RNText style={styles.buttonText}>Open resources</RNText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNextPress}
          style={styles.secondaryButton}
        >
          <RNText style={styles.buttonText}>Go to next book</RNText>
        </TouchableOpacity>
      </View>
    )
  }

  // Single button layout
  return (
    <View style={styles.primaryButtonContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePrimaryPress}
        style={styles.primaryButton}
      >
        <RNText style={styles.buttonText}>{getButtonText(card)}</RNText>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  primaryButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dualButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 16,
    color: '#ffffff',
  },
})

