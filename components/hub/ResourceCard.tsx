import React from 'react'
import { View, Text as RNText, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Dimensions } from 'react-native'
import type { StoryCard } from '@/types/hub'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

const { height } = Dimensions.get('window')

interface ResourceCardProps {
  card: StoryCard
  onPress: () => void
}

export function ResourceCard({ card, onPress }: ResourceCardProps) {
  const playPageFlipSound = usePageFlipSound()
  const isLocked = card.status === 'locked'

  return (
    <View style={styles.resourceCardWrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          playPageFlipSound()
          onPress()
        }}
        disabled={isLocked}
        style={styles.resourceCardTouchable}
      >
        <View 
          style={[
            styles.resourceCard,
            isLocked && styles.resourceCardLocked
          ]}
        >
          <ImageBackground
            source={require('../../assets/UI/cards/libraryResource.jpg')}
            style={styles.resourceCardBackground}
            resizeMode="cover"
            imageStyle={styles.resourceCardImage}
          >
            <View style={styles.resourceCardOverlay} />
            <View style={styles.resourceCardContent}>
              <View style={styles.resourceCardHeader}>
                <RNText 
                  style={styles.resourceLabelText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {card.label}
                </RNText>
                {!isLocked && (
                  <MaterialCommunityIcons 
                    name="arrow-right" 
                    size={24} 
                    color="#ffffffcc" 
                    style={styles.resourceCardIcon}
                  />
                )}
              </View>
              <RNText 
                style={[
                  styles.resourceTitleText,
                  isLocked && styles.resourceTitleTextLocked
                ]}
                adjustsFontSizeToFit
                numberOfLines={2}
                minimumFontScale={0.7}
              >
                {isLocked ? 'Locked' : `${card.label} Resources`}
              </RNText>
              {!isLocked && (
                <RNText 
                  style={styles.resourceSubtitleText}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  View attributes and equipment
                </RNText>
              )}
            </View>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  resourceCardWrapper: {
    paddingHorizontal: 0,
    paddingBottom: 16,
    width: '100%',
  },
  resourceCardTouchable: {
    borderRadius: 24,
  },
  resourceCard: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 0,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resourceCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.6,
  },
  resourceCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  resourceCardImage: {
    opacity: 0.9,
  },
  resourceCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  resourceCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  resourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 8,
  },
  resourceLabelText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    flex: 1,
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
    width: '100%',
    paddingHorizontal: 8,
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
    width: '100%',
    paddingHorizontal: 8,
  },
})

