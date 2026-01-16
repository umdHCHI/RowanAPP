import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import type { Fragment } from '@/types/game'

interface GameFragmentProps {
  fragment: Fragment
  onTap: (fragmentId: string) => void
}

export function GameFragment({ fragment, onTap }: GameFragmentProps) {
  const [opacity] = useState(() => new Animated.Value(1))
  const fadeOutStartedRef = useRef(false)

  // Fade out as TTL approaches
  useEffect(() => {
    const ttl = fragment.ttlMs
    const fadeStartTime = ttl * 0.6 // Start fading at 60% of TTL
    
    const timer = setTimeout(() => {
      if (!fadeOutStartedRef.current) {
        fadeOutStartedRef.current = true
        Animated.timing(opacity, {
          toValue: 0,
          duration: ttl * 0.4, // Fade over remaining 40% of TTL
          useNativeDriver: true,
        }).start()
      }
    }, fadeStartTime)

    return () => clearTimeout(timer)
  }, [fragment.ttlMs, opacity])

  function handlePress() {
    onTap(fragment.id)
  }

  const isWellness = fragment.kind === 'wellness'

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          left: fragment.x,
          top: fragment.y,
        },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[
          styles.fragment,
          isWellness ? styles.wellnessFragment : styles.negativeFragment,
          { opacity },
        ]}
        pointerEvents="auto"
      >
        <Text
          style={[
            styles.text,
            isWellness ? styles.wellnessText : styles.negativeText,
          ]}
          numberOfLines={2}
        >
          {fragment.text}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 150, // Above gameplay, below overlays
  },
  fragment: {
    minWidth: 180, // Smaller for readability
    maxWidth: 220, // Smaller max width
    paddingHorizontal: 14, // Reduced padding
    paddingVertical: 10, // Reduced padding
    borderRadius: 14, // Smaller radius
    borderWidth: 2, // Thicker border for visibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellnessFragment: {
    backgroundColor: 'rgba(20, 40, 30, 0.85)', // Darker, more opaque
    borderColor: 'rgba(107, 190, 146, 0.8)', // More visible border
  },
  negativeFragment: {
    backgroundColor: 'rgba(40, 20, 20, 0.85)', // Darker, more opaque
    borderColor: 'rgba(200, 100, 100, 0.8)', // More visible border
  },
  text: {
    fontFamily: 'Quicksand-SemiBold', // No italics for combat readability
    fontSize: 16, // Slightly smaller but readable
    textAlign: 'center',
    lineHeight: 20, // Tighter line height
    fontWeight: '600', // Bolder for readability
  },
  wellnessText: {
    color: 'rgba(200, 255, 220, 0.95)',
  },
  negativeText: {
    color: 'rgba(255, 200, 200, 0.95)',
  },
})
