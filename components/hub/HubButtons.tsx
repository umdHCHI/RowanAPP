import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { StoryCard } from '@/types/hub'
import { Button, Text } from '@/components/ui'

interface HubButtonsProps {
  card: StoryCard
  onPrimaryPress: () => void
  onResourcePress: () => void
  onNextPress: () => void
}

function getButtonText(card: StoryCard): string {
  if (card.status === 'completed') return 'Revisit this Book'
  return 'Explore this Book'
}

export function HubButtons({ card, onPrimaryPress, onResourcePress, onNextPress }: HubButtonsProps) {
  const titleLower = String(card.title ?? '').toLowerCase()
  const isIntroduction = titleLower.includes('introduction') || titleLower === 'introduction'
  // Introduction should never show resource buttons
  const showResourceButtons = !isIntroduction && card.hasResources && card.status === 'completed'

  if (showResourceButtons && card.status === 'completed') {
    // Two button layout for completed cards
    return (
      <View style={styles.container}>
        <Button
          variant="primary"
          onPress={onResourcePress}
          fullWidth
          hapticType="light"
        >
          <Text variant="title" size={1}>Open resources</Text>
        </Button>

        <Button
          variant="primary"
          onPress={onNextPress}
          fullWidth
          hapticType="light"
        >
          <Text variant="title" size={1}>Go to next book</Text>
        </Button>
      </View>
    )
  }

  // Single button layout
  return (
    <View style={styles.container}>
      <Button
        variant="primary"
        onPress={onPrimaryPress}
        fullWidth
      >
        <Text variant="title" size={1}>{getButtonText(card)}</Text>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 16,
    gap: 12,
  },
})

