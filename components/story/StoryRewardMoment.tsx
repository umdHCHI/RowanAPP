import React, { useEffect, useRef } from 'react'
import { View, Text as RNText, StyleSheet, Pressable, Animated, Image } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS, STORY_LINE_HEIGHTS } from './story-theme'

export type RewardType = 'JOURNAL_REWARD' | 'MINIGAME' | 'POWER' | 'ITEM' | 'ACTION_SCENE' | 'LUMENS'

interface StoryRewardMomentProps {
  type: RewardType
  title: string
  subtitle?: string
  icon?: React.ReactNode
  imageUrl?: string | null
  onPress?: () => void
  lumensAmount?: number
  theme?: {
    primary: string
    background: string
    text: string
  }
}

export function StoryRewardMoment({
  type,
  title,
  subtitle,
  icon,
  imageUrl,
  onPress,
  lumensAmount,
  theme,
}: StoryRewardMomentProps) {
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const lumensGlowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  // Animate lumens glow effect
  useEffect(() => {
    if (type === 'LUMENS') {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(lumensGlowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(lumensGlowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )
      glowAnimation.start()
      return () => glowAnimation.stop()
    }
  }, [type, lumensGlowAnim])

  // Use golden/yellow for lumens, default gold for others
  const primaryColor = theme?.primary || (type === 'LUMENS' ? '#FFD700' : '#FFD700')
  const textColor = theme?.text || 'rgba(255, 255, 255, 0.9)'
  const accentColor = type === 'LUMENS' 
    ? `rgba(255, 215, 0, 0.5)` // Brighter for lumens to visualize light
    : `rgba(255, 215, 0, 0.3)`

  function handlePress() {
    if (onPress) {
      haptics.lightImpact()
      playPageFlipSound()
      onPress()
    }
  }

  function renderIcon() {
    if (icon) {
      return icon
    }

    // Default icon based on type
    if (type === 'JOURNAL_REWARD') {
      return (
        <MaterialCommunityIcons 
          name="book-open-variant" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'MINIGAME') {
      return (
        <MaterialCommunityIcons 
          name="gamepad-variant" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'POWER') {
      return (
        <MaterialCommunityIcons 
          name="lightning-bolt" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'ACTION_SCENE') {
      return (
        <MaterialCommunityIcons 
          name="image-multiple" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'LUMENS') {
      return (
        <MaterialCommunityIcons 
          name="lightbulb-on" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    return (
      <MaterialCommunityIcons 
        name="gift" 
        size={32} 
        color={primaryColor} 
      />
    )
  }

  function getLabel() {
    switch (type) {
      case 'JOURNAL_REWARD':
        return 'NEW JOURNAL UNLOCKED'
      case 'MINIGAME':
        return 'MINIGAME UNLOCKED'
      case 'POWER':
        return 'NEW POWER UNLOCKED'
      case 'ITEM':
        return 'NEW ITEM UNLOCKED'
      case 'ACTION_SCENE':
        return 'ACTION SCENE'
      case 'LUMENS':
        return 'LUMENS EARNED'
      default:
        return 'REWARD UNLOCKED'
    }
  }

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Action Scene Image */}
      {type === 'ACTION_SCENE' && (
        <View style={styles.actionImageContainer}>
          {imageUrl ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={styles.actionImage}
                resizeMode="cover"
                onError={(error) => {
                  console.warn('[StoryRewardMoment] Failed to load action scene image:', imageUrl, error)
                }}
                onLoad={() => {
                  console.log('[StoryRewardMoment] Successfully loaded action scene image:', imageUrl)
                }}
              />
              <View style={styles.actionImageOverlay} />
            </>
          ) : (
            <View style={styles.actionImagePlaceholder}>
              <RNText style={styles.actionImagePlaceholderText}>No Image Available</RNText>
            </View>
          )}
        </View>
      )}

      {/* Divider lines */}
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: accentColor }]} />
        <View style={styles.iconContainer}>
          {/* Enhanced glow effect for lumens to visualize light */}
          {type === 'LUMENS' ? (
            <>
              <Animated.View 
                style={[
                  styles.lumensGlowOuter, 
                  { 
                    backgroundColor: `${primaryColor}15`,
                    opacity: lumensGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.lumensGlowMiddle, 
                  { 
                    backgroundColor: `${primaryColor}30`,
                    opacity: lumensGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.lumensGlowInner, 
                  { 
                    backgroundColor: `${primaryColor}50`,
                    opacity: lumensGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }
                ]} 
              />
            </>
          ) : (
            <View style={[styles.glow, { backgroundColor: `${primaryColor}20` }]} />
          )}
          <View style={[styles.iconWrapper, { borderColor: accentColor }]}>
            {renderIcon()}
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: accentColor }]} />
      </View>

      {/* Label */}
      <RNText style={[styles.label, { color: accentColor }]}>
        {getLabel()}
      </RNText>

      {/* Title */}
      <RNText style={[styles.title, { color: primaryColor }]}>
        {type === 'LUMENS' && lumensAmount !== undefined
          ? `+${lumensAmount} Lumens`
          : title}
      </RNText>

      {/* Subtitle */}
      {subtitle && (
        <RNText style={[styles.subtitle, { color: textColor }]}>
          {subtitle}
        </RNText>
      )}
    </Animated.View>
  )

  if (onPress) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        {content}
      </Pressable>
    )
  }

  return content
}

const styles = StyleSheet.create({
  pressable: {
    marginVertical: STORY_SPACING.xl,
  },
  container: {
    alignItems: 'center',
    marginVertical: STORY_SPACING.xl,
    paddingVertical: STORY_SPACING.xxl,
    paddingHorizontal: STORY_SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: STORY_SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    marginHorizontal: STORY_SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  lumensGlowOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.8,
  },
  lumensGlowMiddle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.7,
  },
  lumensGlowInner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: STORY_SPACING.sm,
    opacity: 0.8,
  },
  title: {
    fontFamily: STORY_FONTS.beyondWonderland,
    fontSize: STORY_FONT_SIZES.xxl,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: STORY_LINE_HEIGHTS.xxl,
    marginBottom: STORY_SPACING.md,
  },
  subtitle: {
    fontFamily: STORY_FONTS.fontTitleWhite,
    fontSize: STORY_FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: STORY_LINE_HEIGHTS.md,
    opacity: 0.7,
    paddingHorizontal: STORY_SPACING.xl,
  },
  actionImageContainer: {
    width: '100%',
    height: 200,
    marginBottom: STORY_SPACING.lg,
    borderRadius: STORY_BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  actionImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionImagePlaceholderText: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    color: STORY_COLORS.textSecondary,
    textAlign: 'center',
  },
})

