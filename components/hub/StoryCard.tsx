import React, { useState } from 'react'
import { View, Text as RNText, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard as StoryCardType } from '@/types/hub'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { ContentWarningModal } from './ContentWarningModal'

interface StoryCardProps {
  card: StoryCardType
}

export function StoryCard({ card }: StoryCardProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const [isContentWarningVisible, setIsContentWarningVisible] = useState(false)
  const isCompleted = card.status === 'completed'


  const hasBackendImage = !!card.imageUrl

  return (
    <View style={styles.storyCardWrapper}>
      <View style={styles.storyCard}>
        {/* Background - Backend image */}
        {hasBackendImage && card.imageUrl && (
          <View style={styles.storyCardBackground}>
            <Image
              source={{ uri: card.imageUrl }}
              style={styles.storyCardBackground}
              resizeMode="cover"
            />
            {/* Blur overlay effect */}
            <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
          </View>
        )}

        {/* Card content - needs to be above background */}
        <View style={styles.cardContent}>
          {/* Header with label and book icon */}
          <View style={styles.cardHeader}>
            <View style={styles.labelWrapper}>
              <RNText style={styles.labelText} numberOfLines={1}>{card.label}</RNText>
            </View>
            
            {/* Book icon for completed chapters */}
            {isCompleted && (
              <TouchableOpacity 
                style={styles.bookIcon}
                onPress={() => {
                  haptics.lightImpact()
                  playPageFlipSound()
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="book-open-outline" size={28} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
         
          {/* Title section */}
          <View style={styles.titleSection}>
            <RNText 
              style={styles.titleText}
            >
              {card.title}
            </RNText>
            <RNText 
              style={styles.subtitleText}
            >
              {card.subtitle || 'THE ARCHIVE'}
            </RNText>
          </View>

          {/* Bottom section with tagline and content warning */}
          <View style={styles.bottomSection}>
            <RNText 
              style={styles.taglineText}
            >
              {card.tagline || 'Your journey awaits'}
            </RNText>
            
            <TouchableOpacity 
              style={styles.contentWarningButton}
              onPress={() => {
                haptics.lightImpact()
                playPageFlipSound()
                setIsContentWarningVisible(true)
              }}
              activeOpacity={0.7}
            >
              <RNText style={styles.contentWarningText} numberOfLines={1}>
                CONTENT WARNING
              </RNText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content Warning Modal */}
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
  storyCardWrapper: {
    width: Dimensions.get('window').width * 0.95,
    minHeight: Dimensions.get('window').height * 0.55,
    marginBottom: 32,
  },
  storyCard: {
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    minHeight: Dimensions.get('window').height * 0.55,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  storyCardBackground: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: "100%",
    height: '100%',
    overlayColor: 'rgba(0, 255, 255, 0.5)',
    backgroundColor: '#3d5a80',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    marginBottom: 100,
    alignItems: 'center',
    width: '100%',
    minHeight: Dimensions.get('window').height * 0.55,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  titleSection: {
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  titleText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 42,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 48,
    width: '100%',
  },
  subtitleText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffff',
    textAlign: 'center',
    width: '100%',
    marginTop: 4,
    opacity: 0.9,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 32,
    flexShrink: 0,
  },
  taglineText: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    width: '100%',
    lineHeight: 24,
    opacity: 0.9,
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
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    opacity: 0.95,
  },
})

