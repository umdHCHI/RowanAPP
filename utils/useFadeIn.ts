import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

const DEFAULT_DURATION_MS = 175

/**
 * Returns an Animated.Value that fades from 0 to 1 on mount.
 * Prevents double-render flash for dynamically mounted entities (e.g. game projectiles, enemies).
 */
export function useFadeIn(durationMs: number = DEFAULT_DURATION_MS): Animated.Value {
  const fadeIn = useRef(new Animated.Value(0)).current
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: true,
    }).start()
  }, [fadeIn, durationMs])

  return fadeIn
}
