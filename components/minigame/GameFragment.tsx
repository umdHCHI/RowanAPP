import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import type { Fragment } from '@/types/game'

interface GameFragmentProps {
  fragment: Fragment
  onTap: (fragmentId: string) => void
  gameHeight: number
  gameWidth: number
}

export function GameFragment({ fragment, onTap, gameHeight, gameWidth }: GameFragmentProps) {
  const translateY = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0.5)).current // Start brighter
  const hasAnimationStartedRef = useRef(false)

  // Run the fall animation only once per fragment (per mount). Avoids restart when parent
  // re-renders with new object reference but same data. Deps still list all values used
  // so the first run uses current fragment/game state.
  useEffect(() => {
    if (hasAnimationStartedRef.current) return
    hasAnimationStartedRef.current = true

    const distanceToBottom = gameHeight - fragment.y
    const fallDistance = Math.max(distanceToBottom, 300) // At least 300px or to bottom
    
    // Add subtle horizontal drift like a leaf (random left or right, constrained to stay on screen)
    const textMaxWidth = 200
    const leftBoundary = 8
    const rightBoundary = gameWidth - textMaxWidth - 8

    // How far we can drift left/right without going off-screen; clamp to 0 when near edges
    const maxLeftDrift = Math.max(0, fragment.x - leftBoundary)
    const maxRightDrift = Math.max(0, rightBoundary - fragment.x)
    const maxDrift = Math.max(0, Math.min(60, maxLeftDrift, maxRightDrift))
    const rawDrift = (Math.random() - 0.5) * maxDrift * 2 // in [-maxDrift, maxDrift]
    const horizontalDrift = Math.max(-maxLeftDrift, Math.min(maxRightDrift, rawDrift))
    
    // Slow, leaf-like fall: fall downward with gentle horizontal drift
    Animated.parallel([
      // Vertical fall - slow and gentle
      Animated.timing(translateY, {
        toValue: fallDistance, // Fall to bottom of screen
        duration: fragment.ttlMs, // Use full TTL for slow falling animation
        useNativeDriver: true,
      }),
      // Horizontal drift - subtle swaying like a leaf
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: horizontalDrift,
          duration: fragment.ttlMs * 0.4, // Gentle sway over 40% of fall time
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -horizontalDrift * 0.7, // Sway back, less distance
          duration: fragment.ttlMs * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: horizontalDrift * 0.5, // Final gentle sway
          duration: fragment.ttlMs * 0.3,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        // Fade in quickly to brighter
        Animated.timing(opacity, {
          toValue: 0.65, // Brighter text
          duration: 200,
          useNativeDriver: true,
        }),
        // Stay visible until near bottom (95% of animation)
        Animated.delay(fragment.ttlMs * 0.95),
        // Fade out only at the very end
        Animated.timing(opacity, {
          toValue: 0,
          duration: fragment.ttlMs * 0.05, // Fade out over last 5% only
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [translateY, translateX, opacity, fragment.ttlMs, fragment.x, fragment.y, gameHeight, gameWidth])

  const isWellness = fragment.kind === 'wellness'

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: fragment.x,
          top: fragment.y,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    >
      <Pressable
        onPress={() => onTap(fragment.id)}
        style={({ pressed }) => [
          styles.bubble,
          isWellness ? styles.wellnessBubble : styles.negativeBubble,
          ...(pressed ? [styles.bubblePressed] : []),
        ]}
        hitSlop={8}
      >
        <Text
          style={[styles.text, isWellness ? styles.wellnessText : styles.negativeText]}
          numberOfLines={2}
        >
          {fragment.text}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 200,
    paddingHorizontal: 8,
  },
  bubble: {
    borderRadius: 20, // Circular thought bubble
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Subtle dark background for visibility
  },
  wellnessBubble: {
    borderColor: 'rgba(107, 190, 146, 0.5)', // Green-tinted border for wellness thoughts
  },
  negativeBubble: {
    borderColor: 'rgba(200, 100, 100, 0.5)', // Red-tinted border for negative thoughts
  },
  bubblePressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    maxWidth: 180, // Slightly smaller to account for padding
  },
  wellnessText: {
    color: 'rgba(200, 255, 220, 0.75)', // Slightly brighter for visibility in bubble
  },
  negativeText: {
    color: 'rgba(255, 200, 200, 0.75)', // Slightly brighter for visibility in bubble
  },
})
