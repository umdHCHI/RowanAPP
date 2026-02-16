import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ScrollView,
  Dimensions,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthUserId, useRequireAuth } from '@/api'
import { Header, HEADER_BAR_HEIGHT } from '@/components/header'
import { HubPage, HubButtons, HubPagination } from '@/components/hub'
import { useStoryCards, useHubProfile } from '@/hooks'
import type { StoryCard } from '@/types/hub/hub'
import { StoryBackground } from '@/components/story/StoryBackground'
import { Text } from '@/components/ui'
import { hubStyles } from '@/styles/hub/hub-styles'
import { useHubStore } from '@/stores/hub-store'

const { width, height: windowHeight } = Dimensions.get('window')


const HUB_BOTTOM_SECTION_HEIGHT = 110



export default function Hub() {
  useRequireAuth()

  const router = useRouter()
  const insets = useSafeAreaInsets()

  const activeIndex = useHubStore((state) => state.activeIndex)
  const scrollOffsetX = useHubStore((state) => state.scrollOffsetX)
  const pendingRestore = useHubStore((state) => state.pendingRestore)
  const lastUserId = useHubStore((state) => state.lastUserId)
  const setActiveIndex = useHubStore((state) => state.setActiveIndex)
  const setScrollOffsetX = useHubStore((state) => state.setScrollOffsetX)
  const setPendingRestore = useHubStore((state) => state.setPendingRestore)
  const setLastUserId = useHubStore((state) => state.setLastUserId)
  const horizontalScrollRef = useRef<ScrollView>(null)

  const { storyCards, isLoading: isLoadingStories } = useStoryCards()
  useHubProfile()
  const userId = useAuthUserId()

  const computedCarouselHeight = Math.round(
    windowHeight - (insets.top + HEADER_BAR_HEIGHT) - HUB_BOTTOM_SECTION_HEIGHT - insets.bottom
  )
  const [carouselHeight, setCarouselHeight] = useState(computedCarouselHeight)

  function handleCarouselLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout
    const contentHeight = Math.round(height - (insets.top + HEADER_BAR_HEIGHT))
    if (contentHeight > 0) setCarouselHeight(contentHeight)
  }



  function handlePrimaryAction(card: StoryCard) {
    router.push(`/story?storyId=${card.storyId}`)
  }

  function handleResourceAction(card: StoryCard) {
    router.push(`/resources?storyId=${card.storyId}`)
  }

  function handleDotPress(index: number) {
    setActiveIndex(index)
    setScrollOffsetX(index * width)
    horizontalScrollRef.current?.scrollTo({ x: index * width, animated: true })
  }

  useFocusEffect(
    useCallback(() => {
      setPendingRestore(true)
      return () => {}
    }, [setPendingRestore])
  )

  useEffect(() => {
    if (!userId) return

    if (lastUserId === null || lastUserId !== userId) {
      setActiveIndex(0)
      setScrollOffsetX(0)
      setPendingRestore(true)
    }

    if (lastUserId !== userId) {
      setLastUserId(userId)
    }
  }, [userId, lastUserId, setActiveIndex, setScrollOffsetX, setPendingRestore, setLastUserId])

  useEffect(() => {
    if (!storyCards.length || isLoadingStories) return

    const maxIndex = Math.max(0, storyCards.length - 1)
    const clampedIndex = Math.min(activeIndex, maxIndex)
    const fallbackOffset = clampedIndex * width
    const maxOffset = maxIndex * width
    const clampedOffset = Math.min(Math.max(0, scrollOffsetX), maxOffset)
    const targetOffset = clampedOffset > 0 ? clampedOffset : fallbackOffset
    if (activeIndex !== clampedIndex) {
      setActiveIndex(clampedIndex)
    }

    if (pendingRestore) {
      requestAnimationFrame(() => {
        horizontalScrollRef.current?.scrollTo({ x: targetOffset, animated: false })
      })
      setPendingRestore(false)
    }
  }, [
    storyCards.length,
    isLoadingStories,
    activeIndex,
    scrollOffsetX,
    pendingRestore,
    setActiveIndex,
    setPendingRestore,
  ])

  const currentCard = storyCards[activeIndex]

  return (
    <StoryBackground showOverlay={false}>
      <View style={hubStyles.root}>
        <View
          style={[hubStyles.carouselContainer, { paddingTop: insets.top + HEADER_BAR_HEIGHT }]}
          onLayout={handleCarouselLayout}
        >
          {isLoadingStories ? (
            <View style={hubStyles.loadingContainer}>
              <Text variant="body" size={1}>Loading stories...</Text>
            </View>
          ) : (
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={hubStyles.scrollView}
              onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const x = event.nativeEvent.contentOffset.x
                const index = Math.round(x / width)
                if (index !== activeIndex && index >= 0 && index < storyCards.length) {
                  setActiveIndex(index)
                }
              }}
              onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const x = event.nativeEvent.contentOffset.x
                setScrollOffsetX(x)
              }}
              scrollEventThrottle={16}
            >
              {storyCards.map((card, index) => (
                <HubPage
                  key={card.id}
                  card={card}
                  onResourcePress={() => handleResourceAction(card)}
                  carouselHeight={carouselHeight}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={[hubStyles.bottomContainer, { paddingBottom: insets.bottom }]}>
          <HubPagination
            cards={storyCards}
            activeIndex={activeIndex}
            onDotPress={handleDotPress}
          />
          {currentCard && (
            <HubButtons
              card={currentCard}
              onPrimaryPress={() => handlePrimaryAction(currentCard)}
            />
          )}
        </View>
      </View>

      <Header />
    </StoryBackground>
  )
}


