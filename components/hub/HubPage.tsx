import React from 'react'
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StoryCard } from './StoryCard'
import { ResourceCard } from './ResourceCard'
import { ProgressIndicator } from './ProgressIndicator'
import type { StoryCard as StoryCardType } from '@/types/hub'

const { width } = Dimensions.get('window')

interface HubPageProps {
  card: StoryCardType
  isLast: boolean
  onResourcePress: () => void
}

export function HubPage({ card, isLast, onResourcePress }: HubPageProps) {
  const insets = useSafeAreaInsets()
  const isPrologue = card.title.toLowerCase().includes('prologue') || card.title.toLowerCase() === 'prologue'
  // Prologue should never show resources, regardless of hasResources value
  const showResources = !isPrologue && card.hasResources

  // Calculate header height: safe area top + header min height (60) + some padding
  const headerHeight = insets.top + 80

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        style={[styles.verticalScroll, { marginTop: headerHeight }]}
        contentContainerStyle={styles.verticalScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main story card */}
        <StoryCard card={card} />

        {/* Progress indicator and resource card - never show for Prologue */}
        {showResources && (
          <>
            <View style={styles.resourceSection}>
              <ProgressIndicator card={card} isLast={isLast} />
              <ResourceCard card={card} onPress={onResourcePress} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  pageContainer: {
    width: width,
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  resourceSection: {
    marginTop: 16,
    width: '100%',
  },
})

