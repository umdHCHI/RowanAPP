import React, { useState, useRef } from 'react'
import {
  ScrollView,
  Dimensions,
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRequireAuth } from '@/api'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { Header } from '@/components/header'
import { HubPage, HubButtons, HubPagination } from '@/components/hub'
import { useStoryCards, useHubProfile } from '@/hooks'
import type { StoryCard } from '@/types/hub'
import { StoryBackground } from '@/components/story/StoryBackground'
import { Text } from '@/components/ui'

const { width } = Dimensions.get('window')

// Approximate bottom section height: pagination (~48) + button (~56) + padding
const BOTTOM_SECTION_APPROX = 136

export default function Hub() {
  useRequireAuth()

  const router = useRouter()
  const insets = useSafeAreaInsets()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()

  const [activeIndex, setActiveIndex] = useState(0)
  const horizontalScrollRef = useRef<ScrollView>(null)

  const { storyCards, isLoading: isLoadingStories } = useStoryCards()
  useHubProfile()

  const bottomPadding = Math.max(32, insets.bottom + 16)
  const bottomSectionHeight = BOTTOM_SECTION_APPROX + bottomPadding

  function handlePrimaryAction(card: StoryCard) {
    haptics.mediumImpact()
    playPageFlipSound()
    const restartParam = card.status === 'completed' ? '&restart=true' : ''
    router.push(`/story?storyId=${card.storyId}${restartParam}`)
  }

  function handleResourceAction(card: StoryCard) {
    haptics.lightImpact()
    playPageFlipSound()
    router.push(`/resources?storyId=${card.storyId}`)
  }

  function goToNextDream() {
    haptics.lightImpact()
    playPageFlipSound()
    if (activeIndex < storyCards.length - 1) {
      const nextIndex = activeIndex + 1
      setActiveIndex(nextIndex)
      horizontalScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true })
    }
  }

  function handleDotPress(index: number) {
    haptics.lightImpact()
    playPageFlipSound()
    setActiveIndex(index)
    horizontalScrollRef.current?.scrollTo({ x: index * width, animated: true })
  }

  const currentCard = storyCards[activeIndex]

  return (
    <StoryBackground showOverlay={false}>
      <View style={styles.root}>
        {/* Carousel: flex 1, sits above bottom section */}
        <View style={[styles.carouselContainer, { paddingTop: insets.top + 80 }]}>
          {isLoadingStories ? (
            <View style={styles.loadingContainer}>
              <Text variant="body" size={1}>Loading stories...</Text>
            </View>
          ) : (
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.scrollView}
              onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const x = event.nativeEvent.contentOffset.x
                const index = Math.round(x / width)
                if (index !== activeIndex && index >= 0 && index < storyCards.length) {
                  setActiveIndex(index)
                }
              }}
              scrollEventThrottle={16}
            >
              {storyCards.map((card, index) => (
                <HubPage
                  key={card.id}
                  card={card}
                  onResourcePress={() => handleResourceAction(card)}
                  carouselHeight={Dimensions.get('window').height - (insets.top + 80) - bottomSectionHeight}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom: dots + CTA, not overlay */}
        <View style={[styles.bottomContainer, { paddingBottom: bottomPadding, marginTop: -8 }]}>
          <HubPagination
            cards={storyCards}
            activeIndex={activeIndex}
            onDotPress={handleDotPress}
          />
          {currentCard && (
            <HubButtons
              card={currentCard}
              onPrimaryPress={() => handlePrimaryAction(currentCard)}
              onResourcePress={() => handleResourceAction(currentCard)}
              onNextPress={goToNextDream}
            />
          )}
        </View>
      </View>

      <Header />
    </StoryBackground>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bottomContainer: {
    zIndex: 3,
    paddingHorizontal: 24,
  },
})

