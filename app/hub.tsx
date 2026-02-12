import  { useState, useRef } from 'react'
import {
  ScrollView,
  Dimensions,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRequireAuth } from '@/api'
import { Header, HEADER_BAR_HEIGHT } from '@/components/header'
import { HubPage, HubButtons, HubPagination } from '@/components/hub'
import { useStoryCards, useHubProfile } from '@/hooks'
import type { StoryCard } from '@/types/hub/hub'
import { StoryBackground } from '@/components/story/StoryBackground'
import { Text } from '@/components/ui'
import { hubStyles } from '@/styles/hub/hub-styles'

const { width, height: windowHeight } = Dimensions.get('window')


const HUB_BOTTOM_SECTION_HEIGHT = 110



export default function Hub() {
  useRequireAuth()

  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [activeIndex, setActiveIndex] = useState(0)
  const horizontalScrollRef = useRef<ScrollView>(null)

  const { storyCards, isLoading: isLoadingStories } = useStoryCards()
  useHubProfile()

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
    const restartParam = card.status === 'completed' ? '&restart=true' : ''
    router.push(`/story?storyId=${card.storyId}${restartParam}`)
  }

  function handleResourceAction(card: StoryCard) {
    router.push(`/resources?storyId=${card.storyId}`)
  }

  function handleDotPress(index: number) {
    setActiveIndex(index)
    horizontalScrollRef.current?.scrollTo({ x: index * width, animated: true })
  }

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


