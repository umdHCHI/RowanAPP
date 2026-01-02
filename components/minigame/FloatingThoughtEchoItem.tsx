import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'

interface FloatingThoughtEchoItemProps {
  id: string
  text: string
  x: number
  y: number
  gameWidth: number
  gameHeight: number
  onDone: (id: string) => void
}

export function FloatingThoughtEchoItem({
  id,
  text,
  x,
  y,
  gameWidth,
  gameHeight,
  onDone,
}: FloatingThoughtEchoItemProps) {
  const translateY = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.98)).current
  const onDoneRef = useRef(onDone)

  // Keep onDone ref updated
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Clamp position to prevent offscreen
  const clampedX = Math.max(10, Math.min(x, gameWidth - 260))
  const clampedY = Math.max(10, Math.min(y, gameHeight - 80))

  // Trim text if too long
  const displayText = text.length > 60 ? text.substring(0, 60) + '…' : text

  useEffect(() => {
    // Reset values
    translateY.setValue(0)
    opacity.setValue(0)
    scale.setValue(0.98)

    // Fade in and scale up
    const fadeIn = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.0,
        duration: 250,
        useNativeDriver: true,
      }),
    ])

    // Drift upward (full duration)
    const driftUp = Animated.timing(translateY, {
      toValue: -200,
      duration: 4200,
      useNativeDriver: true,
    })

    // Fade out during the last portion of the drift
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    })

    // Sequence: fade in, then drift up with fade out starting after 3.3s
    const animation = Animated.sequence([
      fadeIn,
      Animated.parallel([
        driftUp,
        Animated.sequence([
          Animated.delay(3300), // Stay visible for 3.3s, then fade out over last 0.9s
          fadeOut,
        ]),
      ]),
    ])

    animation.start(() => {
      onDoneRef.current(id)
    })

    // Cleanup on unmount
    return () => {
      animation.stop()
    }
  }, [id, translateY, opacity, scale]) // Only depend on id and animation values

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: clampedX,
          top: clampedY,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {/* Soft blur background */}
      <View style={styles.blurBackground} />
      <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
        {displayText}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    maxWidth: 260,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 16,
  },
  text: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(245, 245, 245, 0.92)',
    fontStyle: 'italic',
    textAlign: 'center',
    zIndex: 1,
  },
})

