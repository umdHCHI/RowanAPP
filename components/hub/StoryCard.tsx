import { useEffect, useState } from 'react'
import {
  Image,
  View
} from 'react-native'

import { ContentWarningModal } from './ContentWarningModal'
import { Text, Button } from '@/components/ui'
import { storyCardStyles } from '@/styles/hub/hub-styles'
import type { StoryCardProps } from '@/types/hub/hub'
import { storyService } from '@/api/services/story.service'



export function StoryCard({ card, height }: StoryCardProps) {

  const [isContentWarningVisible, setIsContentWarningVisible] = useState(false)
  const [storyThemes, setStoryThemes] = useState<string[] | undefined>(card.storyThemes)


  const imageSource = card.imageUrl

  useEffect(() => {
    setStoryThemes(card.storyThemes)
  }, [card.storyThemes])

  function normalizeThemes(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const trimmed = value.trim()
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        }
      } catch {
        return trimmed
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      }
    }

    return []
  }

  async function loadStoryThemes() {
    if (storyThemes?.length) return
    try {
      const story = await storyService.getStoryDetail(card.storyId)
      const normalized = normalizeThemes(story?.story_themes)
      if (normalized.length > 0) setStoryThemes(normalized)
    } catch (error) {
      console.warn('Failed to load story themes for content warning:', error)
    }
  }
 



function handleContentWarningPress() {
  setIsContentWarningVisible(true)
  if (!storyThemes?.length) {
    void loadStoryThemes()
  }
  }

  return (
    <View style={[storyCardStyles.wrapper, { height }]}>
      <View style={storyCardStyles.container}>
        <View style={storyCardStyles.backgroundImage}>
          <Image
            source={
              imageSource
                ? { uri: imageSource }
                : require('../../assets/UI/cards/libraryResource.jpg')
            }
            style={storyCardStyles.image}
            resizeMode="cover"
          />
          <View style={storyCardStyles.dimOverlay} />
        </View>

        <View style={storyCardStyles.cardContent}>
          <View style={storyCardStyles.header}>
            <View style={storyCardStyles.headerLabel}>
              <Text variant="body" size={3} numberOfLines={1} opacity={0.9}>
                {card.label}
              </Text>
            </View>

            
          </View>

          <View style={storyCardStyles.titleSection}>
            <Text variant="heading" size={1}>
              {card.title}
            </Text>
            <Text variant="body" size={3} color="#ffffff" opacity={0.9} marginTop={4}>
              {card.subtitle || 'THE ARCHIVE'}
            </Text>
          </View>

          <View style={storyCardStyles.bottomSection}>
            <Text variant="tagline" size={1} opacity={0.9}>
              {card.tagline || 'Your journey awaits'}
            </Text>

            <Button
              variant="secondary"
              size="small"
              onPress={handleContentWarningPress}
              enableHaptics={true}
              enableSound={true}
            >
              <Text variant="titleWhite" size={2} align="center">
                Content Warning
              </Text>
            </Button>
          </View>
        </View>
      </View> 
      <ContentWarningModal
        visible={isContentWarningVisible}
        onClose={() => setIsContentWarningVisible(false)}
        title={card.title}
        storyThemes={storyThemes}
      />
    </View>
  )
}