import React, { useState } from 'react'
import {
  Image,
  ImageSourcePropType,
  Pressable as RNPressable,
  View,
  StyleSheet,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard as StoryCardType } from '@/types/hub'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { ContentWarningModal } from './ContentWarningModal'
import { Text, Button } from '@/components/ui'

const FALLBACK_IMAGE: ImageSourcePropType = require('@/assets/storyCardBackground/introBackground.png')

interface StoryCardProps {
  card: StoryCardType
  height: number
}

export function StoryCard({ card, height }: StoryCardProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const [isContentWarningVisible, setIsContentWarningVisible] = useState(false)

  const isCompleted = card.status === 'completed'
  const imageSource = card.imageUrl
    ? { uri: card.imageUrl }
    : FALLBACK_IMAGE

  function handleBookIconPress() {
    haptics.lightImpact()
    playPageFlipSound()
  }

  function handleContentWarningPress() {
    haptics.lightImpact()
    playPageFlipSound()
    setIsContentWarningVisible(true)
  }

  return (
    <View style={[styles.wrapper, { height }]}>
      <View style={styles.container}>
        <View style={styles.backgroundImage}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
          <View style={styles.dimOverlay} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLabel}>
              <Text variant="label" numberOfLines={1}>
                {card.label}
              </Text>
            </View>

            {isCompleted && (
              <View style={styles.bookIcon}>
                <RNPressable onPress={handleBookIconPress} hitSlop={10}>
                  <MaterialCommunityIcons name="book-open-outline" size={26} color="#ffffff" />
                </RNPressable>
              </View>
            )}
          </View>

          <View style={styles.titleSection}>
            <Text variant="heading" size={1}>
              {card.title}
            </Text>
            <Text variant="body" size={3} color="#ffffff" opacity={0.9} marginTop={4}>
              {card.subtitle || 'THE ARCHIVE'}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <Text variant="tagline" size={1} opacity={0.9}>
              {card.tagline || 'Your journey awaits'}
            </Text>

            <Button
              variant="secondary"
              size="small"
              onPress={handleContentWarningPress}
              hapticType="light"
            >
              <Text variant="title" size={4} numberOfLines={1}>
                CONTENT WARNING
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

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  image: { width: '100%', height: '100%' },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLabel: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    maxWidth: '80%',
  },
  bookIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  titleSection: { gap: 6 },
  bottomSection: { gap: 12 },
})
