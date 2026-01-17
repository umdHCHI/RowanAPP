import React, { useState, useRef } from 'react'
import { View, ScrollView, ImageBackground, Text as RNText, Dimensions, StyleSheet, TouchableOpacity, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { Header } from '@/components/header'
import { HubPage, HubButtons, HubPagination } from '@/components/hub'
import { useStoryCards } from '@/hooks/use-story-cards'
import { useHubProfile } from '@/hooks/use-hub-profile'
import type { StoryCard } from '@/types/hub'

const { width } = Dimensions.get('window')

export default function Hub() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { story, soundMuted, toggleSoundMute } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const voidClarity = story.voidClarity
  const libraryOpacity = Math.min(1, voidClarity / 100 + 0.3)

  const [activeIndex, setActiveIndex] = useState(0)
  const horizontalScrollRef = useRef<ScrollView>(null)

  // Use custom hooks for data fetching
  const { storyCards, isLoading: isLoadingStories } = useStoryCards()
  useHubProfile() // Handles profile loading and attribute mapping

  function handlePrimaryAction(card: StoryCard) {
    haptics.mediumImpact()
    playPageFlipSound()

    if (card.status === 'locked') {
      router.push('/upgrade')
      return
    }

    // Extract story ID from card.id (format: "story-{id}")
    const storyId = card.id.replace('story-', '')
    router.push(`/story?storyId=${storyId}`)
  }

  function handleResourceAction(card: StoryCard) {
    haptics.lightImpact()
    playPageFlipSound()
    // Extract story ID from card.id (format: "story-{id}")
    const storyId = card.id.replace('story-', '')
    router.push(`/resources?storyId=${storyId}`)
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
    <ImageBackground
      source={require('../assets/UI/hauntedlibrary.png')}
      style={styles.imageCardBackground}
      resizeMode="cover"
    >
      {/* Void overlay */}
      <View
        style={[
          styles.voidOverlay,
          { opacity: Math.max(0.4, 1 - libraryOpacity) }
        ]}
      />

      {/* Horizontal stories carousel */}
      <View style={styles.carouselContainer}>
        {isLoadingStories ? (
          <View style={styles.loadingContainer}>
            <RNText style={styles.loadingText}>Loading stories...</RNText>
          </View>
        ) : (
          <ScrollView
            // @ts-ignore - ref is valid but TypeScript doesn't recognize it in this context
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
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
                isLast={index === storyCards.length - 1}
                onResourcePress={() => handleResourceAction(card)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Top navigation - rendered last to ensure it's on top */}
      <Header />

      {/* Bottom section with pagination and buttons */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        {/* Pagination dots */}
        <HubPagination
          cards={storyCards}
          activeIndex={activeIndex}
          onDotPress={handleDotPress}
        />

        {/* Bottom buttons */}
        {currentCard && (
          <HubButtons
            card={currentCard}
            onPrimaryPress={() => handlePrimaryAction(currentCard)}
            onResourcePress={() => handleResourceAction(currentCard)}
            onNextPress={goToNextDream}
          />
        )}

      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  voidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  imageCardBackground: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain',
    backgroundColor: '#3d5a80',
    zIndex: 0,
  },
  carouselContainer: {
    flex: 1,
    zIndex: 2,
    paddingTop: 0,
  },
  bottomSection: {
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#ffffffcc',
  },
})
