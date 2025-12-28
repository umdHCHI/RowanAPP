import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Text as RNText,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useGameStore, type StoryData } from '@/stores/game-store'
import { Card, useTheme } from 'react-native-paper'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { userService } from '@/api/services/user.service'
import { storyService } from '@/api/services/story.service'
import type { AttributeLevel } from '@/stores/game-store'
import type { UserFullProfileResponse } from '@/api/types'
import { STORY_CHAPTERS, StoryCardConfig } from '@/types/story'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { Header, CircleIcon } from '@/components/header'

const { width, height } = Dimensions.get('window')
const StyledCard = Card as React.ComponentType<any>

// Card states for the story progression
type CardStatus = 'locked' | 'available' | 'completed'

interface StoryCard {
  id: string
  label: string
  title: string
  subtitle: string
  tagline: string
  chapterId: number
  status: CardStatus
  hasResources: boolean
  backgroundImage?: any // require() image
}

export default function Hub() {
  const router = useRouter()
  const { story, setAttributes, stories, setStories, isLoadingStories, setLoadingStories } = useGameStore()
  const theme = useTheme()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const voidClarity = story.voidClarity
  const libraryOpacity = Math.min(1, voidClarity / 100 + 0.3)
  const [activeIndex, setActiveIndex] = useState(0)
  const horizontalScrollRef = useRef<ScrollView>(null)

  // Map API stories to StoryCard format
  function mapStoriesToCards(): StoryCard[] {
    // If no stories loaded yet, return empty array
    if (!stories || stories.length === 0) {
     
      return []
    }

   

    // Helper function to map a story to a card
    function mapStoryToCard(story: StoryData, index: number, isIntroduction = false): StoryCard {
      // Determine status based on story data and user progress
      // For now, we'll use a simple logic - you can enhance this based on story_progress
      let status: CardStatus = 'available'
      if (story.min_level > 1) {
        // Check if user meets level requirement (you can enhance this)
        status = 'locked'
      }

      // Check if story has chapters, but Introduction should never have resources
      const hasResources = isIntroduction ? false : (story.chapters && story.chapters.length > 0)

      return {
        id: `story-${story.id}`,
        label: story.category === 'main' ? `DREAM ${index + 1}` : story.category.toUpperCase(),
        title: story.title,
        subtitle: story.atmosphere || 'THE ARCHIVE',
        tagline: story.description || 'Your journey awaits',
        chapterId: story.id,
        status,
        hasResources,
      }
    }

    // Find the Introduction story (case-insensitive search)
    const introductionStory = stories.find(
      (story) => story.title.toLowerCase().includes('introduction') || story.title.toLowerCase() === 'introduction'
    )

    // Filter stories: only show those with empty personality_focus array (no personality focus)
    // Also exclude Introduction from this list
    const otherStories = stories.filter(
      (story) => {
        const isNotIntroduction = !story.title.toLowerCase().includes('introduction') && story.title.toLowerCase() !== 'introduction'
        const hasEmptyPersonalityFocus = !story.personality_focus || story.personality_focus.length === 0
        return isNotIntroduction && hasEmptyPersonalityFocus
      }
    )

    

    // Map Introduction story to card (if found) - explicitly set hasResources to false
    const introductionCard = introductionStory
      ? mapStoryToCard(introductionStory, 0, true)
      : null

    // Map other stories to cards (only those with empty personality_focus)
    const otherStoryCards: StoryCard[] = otherStories.map((story, index) =>
      mapStoryToCard(story, index + 1, false)
    )

    // Return Introduction first, then other stories with empty personality_focus
    if (introductionCard) {
     
      return [introductionCard, ...otherStoryCards]
    }

    // If no Introduction found, return only stories with empty personality_focus
 
    return otherStoryCards
  }

  // Story cards configuration with status - recalculate when stories change
  // Use useMemo to ensure it recalculates when stories change
  const storyCards: StoryCard[] = React.useMemo(() => {
    const cards = mapStoriesToCards()

    return cards
  }, [stories])

  // Debug: Log when stories change
  useEffect(() => {
  
    if (storyCards.length > 1) {
   
    }
  }, [stories, storyCards])


  useEffect(() => {
    let isMounted = true

    function mapWellnessValueToLevel(value: number): number {
      if (value <= 0) return 1
      const level = Math.round(value / 5)
      if (level < 1) return 1
      if (level > 5) return 5
      return level
    }

    function mapProfileToAttributes(profile: UserFullProfileResponse): AttributeLevel | null {
      if (!profile.character) return null

      const stats = profile.character.wellness_stats
      if (!stats || !Array.isArray(stats)) return null

      const getStat = (label: string) =>
        stats.find((stat) => stat.label.toLowerCase() === label.toLowerCase())?.value ?? 0

      const explorationValue = getStat('Exploration')
      const courageValue = getStat('Courage')
      const connectionValue = getStat('Connection')
      const fearValue = getStat('Fear')

      return {
        connection: mapWellnessValueToLevel(connectionValue),
        courage: mapWellnessValueToLevel(courageValue),
        exploration: mapWellnessValueToLevel(explorationValue),
        fear: mapWellnessValueToLevel(fearValue),
      }
    }

    async function loadFullProfile() {
      try {
        const response = await userService.getFullProfile(3)
        if (!isMounted) return
        if (!response.success || !response.data) return

        const mappedAttributes = mapProfileToAttributes(response.data)
        if (!mappedAttributes) return

        setAttributes(mappedAttributes)
      } catch (error) {
        console.error('Failed to load user full profile for hub attributes', error)
      }
    }

    async function loadStories() {
      try {
        setLoadingStories(true)
        const storiesData = await storyService.getAllStories()
        
        if (!isMounted) return

        if (storiesData && Array.isArray(storiesData) && storiesData.length > 0) {
          setStories(storiesData)
        } else {
          console.warn('No stories returned from API or empty array')
        }
      } catch (error) {
        console.error('Failed to load stories:', error)
      } finally {
        if (isMounted) {
          setLoadingStories(false)
        }
      }
    }

    loadFullProfile()
    loadStories()

    return () => {
      isMounted = false
    }
  }, [setAttributes, setStories, setLoadingStories])

  function handlePrimaryAction(card: StoryCard) {
    haptics.mediumImpact()
    playPageFlipSound()

    if (card.status === 'locked') {
      // Handle upgrade flow
      router.push('/upgrade')
      return
    }

    router.push('/story')
  }

  function handleResourceAction(card: StoryCard) {
    haptics.lightImpact()
    // Navigate to resources for this dream
    router.push(`/resources/`)
  }

  function goToNextDream() {
    haptics.lightImpact()
    if (activeIndex < storyCards.length - 1) {
      const nextIndex = activeIndex + 1
      setActiveIndex(nextIndex)
      horizontalScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true })
    }
  }

  function getButtonText(card: StoryCard): string {
    if (card.id === 'intro') return 'Begin'
    if (card.status === 'locked') return 'Upgrade to continue now'
    if (card.status === 'completed') return 'Replay this dream'
    return 'Begin this dream'
  }

  function getResourceButtonText(card: StoryCard): string {
    if (card.status === 'locked') return `Complete ${card.label} to continue`
    return 'Open resources'
  }

  // Render the progress line with indicator
  function renderProgressIndicator(card: StoryCard, isLast: boolean) {
    const isLocked = card.status === 'locked'
    
    return (
      <View style={styles.progressContainer}>
        {/* Top line */}
        <View style={styles.progressLine} />
        
        {/* Circle or Lock indicator */}
        <View style={[
          styles.progressIndicator,
          isLocked && styles.progressIndicatorLocked
        ]}>
          {isLocked ? (
            <MaterialCommunityIcons name="lock" size={14} color="#ffffff88" />
          ) : (
            <View style={styles.progressIndicatorInner} />
          )}
        </View>
        
        {/* Bottom line */}
        {!isLast && <View style={styles.progressLine} />}
      </View>
    )
  }

  // Render a single story card
  function renderStoryCard(card: StoryCard) {
    const isLocked = card.status === 'locked'
    const isCompleted = card.status === 'completed'
    const isIntroduction = card.title.toLowerCase().includes('introduction') || card.title.toLowerCase() === 'introduction'

    return (
      <View style={styles.storyCardWrapper}>
        <StyledCard style={styles.storyCard} elevation={4} mode="elevated">
          {/* Background - Image for Introduction story */}
          {isIntroduction && (
            <View style={styles.storyCardBackground}>
              <Image
                source={require('../assets/storyCardBackground/introStoryCard.jpg')}
                style={styles.storyCardBackground}
                resizeMode="cover"
              />
              {/* Blur overlay effect */}
              <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
            </View>
          )} 
            
         

          {/* Card content */}
          <View style={styles.labelContainer}>
            {/* Header with label and book icon */}
            <View style={styles.cardHeader}>
              <View style={styles.labelContainer}>
                <RNText style={styles.labelText}>{card.label}</RNText>
              </View>
              
              {/* Book icon for completed chapters */}
              {isCompleted && (
                <TouchableOpacity style={styles.bookIcon}>
                  <MaterialCommunityIcons name="book-open-outline" size={28} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
           
            {/* Title section */}
            <View style={styles.titleSection}>
              <RNText style={styles.titleText}>{card.title}</RNText>
              <RNText style={styles.subtitleText}>{card.subtitle}</RNText>
            </View>

            {/* Bottom section with tagline and content warning */}
            <View style={styles.bottomSection}>
              <RNText style={styles.taglineText}>{card.tagline}</RNText>
              
              <TouchableOpacity style={styles.contentWarningButton}>
                <RNText style={styles.contentWarningText}>CONTENT WARNING</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </StyledCard>
      </View>
    )
  }

  // Render a resource card
  function renderResourceCard(card: StoryCard) {
    const isLocked = card.status === 'locked'

    return (
      <View style={styles.resourceCardWrapper}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (!isLocked) {
              handleResourceAction(card)
            }
          }}
          disabled={isLocked}
          style={styles.resourceCardTouchable}
        >
          <StyledCard 
            style={[
              styles.resourceCard,
              isLocked && styles.resourceCardLocked
            ]} 
            elevation={3} 
            mode="elevated"
          >
            <View style={[StyleSheet.absoluteFill, styles.resourceCardBackground]} />
            
            <View style={styles.resourceCardContent}>
              <View style={styles.resourceCardHeader}>
                <RNText style={styles.resourceLabelText}>{card.label}</RNText>
                {!isLocked && (
                  <MaterialCommunityIcons 
                    name="arrow-right" 
                    size={24} 
                    color="#ffffffcc" 
                    style={styles.resourceCardIcon}
                  />
                )}
              </View>
              <RNText style={[
                styles.resourceTitleText,
                isLocked && styles.resourceTitleTextLocked
              ]}>
                {isLocked ? 'Locked' : `${card.label} Resources`}
              </RNText>
              {!isLocked && (
                <RNText style={styles.resourceSubtitleText}>
                  View attributes and equipment
                </RNText>
              )}
            </View>
          </StyledCard>
        </TouchableOpacity>
      </View>
    )
  }

  // Render a complete page (story card + progress + resource card)
  function renderPage(card: StoryCard, index: number, key: string) {
    const isLast = index === storyCards.length - 1
    const isIntroduction = card.title.toLowerCase().includes('introduction') || card.title.toLowerCase() === 'introduction'
    // Introduction should never show resources, regardless of hasResources value
    const showResources = isIntroduction ? false : card.hasResources
    const isLocked = card.status === 'locked'

    // Debug log for first few cards
    if (index < 3) {
      console.log(`Rendering card ${index}:`, card.title, card.id, 'hasResources:', card.hasResources, 'showResources:', showResources)
    }

    return (
      <View key={key} style={styles.pageContainer}>
        <ScrollView
          style={styles.verticalScroll}
          contentContainerStyle={styles.verticalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main story card */}
          {renderStoryCard(card)}

          {/* Progress indicator and resource card - never show for Introduction */}
          {showResources && !isIntroduction && (
            <>
              {renderProgressIndicator(card, isLast)}
              {renderResourceCard(card)}
            </>
          )}
        </ScrollView>
      </View>
    )
  }

  // Render bottom buttons based on current card
  function renderBottomButtons() {
    const currentCard = storyCards[activeIndex]
    const isIntroduction = currentCard.title.toLowerCase().includes('introduction') || currentCard.title.toLowerCase() === 'introduction'
    // Introduction should never show resource buttons
    const showResourceButtons = !isIntroduction && currentCard.hasResources && currentCard.status !== 'available'

    if (showResourceButtons && currentCard.status === 'completed') {
      // Two button layout for completed cards
      return (
        <View style={styles.dualButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleResourceAction(currentCard)}
            style={styles.secondaryButton}
          >
            <RNText style={styles.buttonText}>Open resources</RNText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={goToNextDream}
            style={styles.secondaryButton}
          >
            <RNText style={styles.buttonText}>Go to next dream</RNText>
          </TouchableOpacity>
        </View>
      )
    }

    // Single button layout
    return (
      <View style={styles.primaryButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handlePrimaryAction(currentCard)}
          style={styles.primaryButton}
        >
          <RNText style={styles.buttonText}>{getButtonText(currentCard)}</RNText>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ImageBackground
      source={require('../hauntedlibrary.png')}
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

      {/* Top navigation */}
      <Header
        rightActions={[
          {
            onPress: () => {
              haptics.lightImpact()
            },
            customComponent: <CircleIcon size={28} />,
          },
          {
            icon: 'web',
            onPress: () => {
              haptics.lightImpact()
            },
          },
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
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const x = event.nativeEvent.contentOffset.x
              const index = Math.round(x / width)
              if (index !== activeIndex && index >= 0 && index < storyCards.length) {
                setActiveIndex(index)
              }
            }}
            scrollEventThrottle={16}
          >
            {storyCards.map((card, index) => renderPage(card, index, card.id))}
          </ScrollView>
        )}
      </View>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {storyCards.map((card, index) => {
          const isActive = index === activeIndex
          return (
            <TouchableOpacity
              key={card.id}
              onPress={() => {
                setActiveIndex(index)
                horizontalScrollRef.current?.scrollTo({ x: index * width, animated: true })
              }}
            >
              <View
                style={[
                  styles.paginationDot,
                  isActive && styles.paginationDotActive
                ]}
              />
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Bottom buttons */}
      {renderBottomButtons()}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05020b',
  },
  voidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  

  // Carousel
  carouselContainer: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },

  // Story card
  storyCardWrapper: {
    padding: 24,
    
  },
  storyCard: {
    flex: 1,
    height: height * 0.6,
    borderRadius: 24,
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },

  imageCardBackground: {
    ...StyleSheet.absoluteFillObject,
   
    resizeMode: 'contain', 
    backgroundColor: '#3d5a80',
  },
  storyCardBackground: {
   ...StyleSheet.absoluteFillObject,
   flex: 1,
   width: 200,
   height: 650,
   overlayColor: 'rgba(0, 255, 255, 0.5)',
    backgroundColor: '#3d5a80',
  },
  
  // Card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',

  },
  labelText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
  },
  bookIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },

  // Title section
  titleSection: {
    alignItems: 'center',
    marginTop: -40,
  },
  titleText: {
    fontFamily: 'BeyondWonderland', // Use your serif font
    fontSize: 42,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 48,
  },
  subtitleText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
  },

  // Bottom section
  bottomSection: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 200,
  },
  taglineText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#ffffffdd',
    textAlign: 'center',
    lineHeight: 22,
  },
  contentWarningButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentWarningText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffffcc',
  },

  // Progress indicator
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressLine: {
    width: 1.5,
    height: 40,
    backgroundColor: '#ffffff44',
  },
  progressIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff66',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressIndicatorLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressIndicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },

  // Resource card
  resourceCardWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  resourceCardTouchable: {
    borderRadius: 24,
  },
  resourceCard: {
    flex: 1,
    minHeight: height * 0.25,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resourceCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.6,
  },
  resourceCardBackground: {
    backgroundColor: '#1a2433',
  },
  resourceCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  resourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  resourceLabelText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
  },
  resourceCardIcon: {
    marginTop: 2,
  },
  resourceTitleText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 38,
  },
  resourceTitleTextLocked: {
    color: '#ffffff88',
    fontSize: 28,
  },
  resourceSubtitleText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#ffffffaa',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff66',
  },
  paginationDotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },

  // Bottom buttons
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
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Loading state
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