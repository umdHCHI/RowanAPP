import { useState } from 'react'
import {
  Image,
  View
} from 'react-native'

import { ContentWarningModal } from './ContentWarningModal'
import { Text, Button } from '@/components/ui'
import { storyCardStyles } from '@/styles/hub/hub-styles'
import type { StoryCardProps } from '@/types/hub/hub'



export function StoryCard({ card, height }: StoryCardProps) {

  const [isContentWarningVisible, setIsContentWarningVisible] = useState(false)

  const isCompleted = card.status === 'completed'
  const imageSource = card.imageUrl
 



function handleContentWarningPress() {
       setIsContentWarningVisible(true)
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

            {isCompleted && (
              <View style={storyCardStyles.bookIcon}>
               
              </View>
            )}
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
        revelations={card.revelations}
      />
    </View>
  )
}