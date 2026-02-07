import React from 'react'
import { ScrollView, Dimensions, View, StyleSheet } from 'react-native'
import { StoryCard } from './StoryCard'
import { ResourceCard } from './ResourceCard'
import { ProgressIndicator } from './ProgressIndicator'
import type { StoryCard as StoryCardType } from '@/types/hub'

const { width } = Dimensions.get('window')

interface HubPageProps {
  card: StoryCardType
  isLast: boolean
  onResourcePress: () => void
  carouselHeight: number
}

export function HubPage({ card, isLast, onResourcePress, carouselHeight }: HubPageProps) {
  const titleLower = String(card.title ?? '').toLowerCase()
  const isPrologue =
    titleLower.includes('prologue') || titleLower === 'prologue'
  const showResources = !isPrologue && card.hasResources

  // Tall cards: use ~90% of carousel height to match design (long, prominent cards)
  const cardHeight = Math.round(carouselHeight * 1.0)
  const hasScroll = showResources

  return (
    <View style={[styles.page, { width, height: carouselHeight }]}>
      {hasScroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <StoryCard card={card} height={cardHeight} />
          <View style={styles.resourcesBlock}>
            <ProgressIndicator card={card} isLast={isLast} />
            <ResourceCard card={card} onPress={onResourcePress} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.cardContainer}>
          <StoryCard card={card} height={cardHeight} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 36,
    paddingTop: 12,
    paddingBottom: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  resourcesBlock: {
    marginTop: 16,
    width: '100%',
  },
})

