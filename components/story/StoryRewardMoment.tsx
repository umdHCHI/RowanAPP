import React, { useEffect, useRef } from 'react'
import { View, Text as RNText, StyleSheet, Pressable, Animated, Image, ImageSourcePropType } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { STORY_COLORS, STORY_SPACING, STORY_BORDER_RADIUS, STORY_FONT_SIZES, STORY_FONTS, STORY_LINE_HEIGHTS } from './story-theme'

export type RewardType = 'JOURNAL_REWARD' | 'MINIGAME' | 'POWER' | 'ITEM' | 'ACTION_SCENE' | 'LUMENS'

const DEFAULT_LUMENS_IMAGE: ImageSourcePropType = {
  uri: 'https://backend.131.212.41.8.nip.io/media/npc_portraits/lumen_golden.png',
}

interface StoryRewardMomentProps {
  type: RewardType
  title: string
  subtitle?: string
  icon?: React.ReactNode
  imageSource?: ImageSourcePropType | null
  lumensAmount?: number
  onPress?: () => void
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
  imageSource,
  lumensAmount,
  onPress,
  theme,
}: StoryRewardMomentProps) {
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

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

  const primaryColor = theme?.primary || '#FFD700'
  const textColor = theme?.text || 'rgba(255, 255, 255, 0.9)'
  const accentColor = `rgba(255, 215, 0, 0.3)`

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
        <MaterialDesignIcons 
          name="book-open-variant" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'MINIGAME') {
      return (
        <MaterialDesignIcons 
          name="gamepad-variant" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'POWER') {
      return (
        <MaterialDesignIcons 
          name="lightning-bolt" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'ACTION_SCENE') {
      return (
        <MaterialDesignIcons 
          name="image-multiple" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    if (type === 'LUMENS') {
      return (
        <MaterialDesignIcons 
          name="star-four-points" 
          size={32} 
          color={primaryColor} 
        />
      )
    }

    return (
      <MaterialDesignIcons 
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

  function getTitle() {
    switch (type) {
      case 'JOURNAL_REWARD':
        return 'Tap to document this moment'
      case 'MINIGAME':
        return 'Tap to seal the Void'
      case 'POWER':
        return 'Tap to unlock a new power'
      case 'ITEM':
        return 'Tap to unlock a new item'
      case 'ACTION_SCENE':
        return null
      case 'LUMENS':
        return 'Lumens helping you seal the Void'
      default:
        return 'Tap to view the reward'
    }
  }

  const shouldShowImage = type === 'ACTION_SCENE' || type === 'LUMENS'
  const resolvedImageSource = imageSource || (type === 'LUMENS' ? DEFAULT_LUMENS_IMAGE : null)
  const isLumensReward = type === 'LUMENS' && typeof lumensAmount === 'number'

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
      {shouldShowImage && (
        <View style={styles.actionImageContainer}>
          {resolvedImageSource ? (
            <>
              <Image
                source={resolvedImageSource}
                style={styles.actionImage}
                resizeMode="cover"
                onError={(error) => {
                  console.warn('[StoryRewardMoment] Failed to load reward image', error)
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
          {/* Glow effect behind icon */}
          <View style={[styles.glow, { backgroundColor: `${primaryColor}20` }]} />
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
        {getTitle()}
      </RNText>

      {isLumensReward && (
        <View style={styles.lumensBadge}>
          <RNText style={styles.lumensBadgeValue}>+{lumensAmount}</RNText>
          <RNText style={styles.lumensBadgeLabel}>Lumens</RNText>
        </View>
      )}

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
  lumensBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    alignSelf: 'center',
    gap: STORY_SPACING.xs,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: STORY_BORDER_RADIUS.md,
    paddingHorizontal: STORY_SPACING.md,
    paddingVertical: STORY_SPACING.xs,
    marginTop: STORY_SPACING.sm,
  },
  lumensBadgeValue: {
    fontFamily: STORY_FONTS.beyondWonderland,
    fontSize: STORY_FONT_SIZES.lg,
    color: STORY_COLORS.text,
  },
  lumensBadgeLabel: {
    fontFamily: STORY_FONTS.system,
    fontSize: STORY_FONT_SIZES.sm,
    letterSpacing: 1,
    color: STORY_COLORS.textSecondary,
    textTransform: 'uppercase',
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

