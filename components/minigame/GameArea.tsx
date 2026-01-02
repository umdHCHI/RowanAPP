import { useMemo, useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'
import { runOnJS } from 'react-native-reanimated'
import type { ReactNode } from 'react'

interface GameAreaProps {
  width: number
  height: number
  children: ReactNode
  onPlayerMove?: (x: number) => void
  onShoot?: () => void
  playerLastHitAt?: number
}

export function GameArea({ width, height, children, onPlayerMove, onShoot, playerLastHitAt }: GameAreaProps) {
  const panActive = useSharedValue(false)
  const panStartX = useSharedValue(0)
  const panStartY = useSharedValue(0)
  const tapStartX = useSharedValue(0)
  const tapStartY = useSharedValue(0)
  const [showHint, setShowHint] = useState(true)
  const hintOpacity = useMemo(() => new Animated.Value(1), [])
  const hitFlashOpacity = useMemo(() => new Animated.Value(0), [])
  const lastHitAtRef = useRef<number>(0)

  // Fade out hint after 3 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowHint(false))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showHint, hintOpacity])

  // Handle player hit flash
  useEffect(() => {
    if (playerLastHitAt && playerLastHitAt !== lastHitAtRef.current) {
      lastHitAtRef.current = playerLastHitAt
      hitFlashOpacity.setValue(1)
      Animated.timing(hitFlashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [playerLastHitAt, hitFlashOpacity])

  // Memoize gestures to prevent recreation on every render
  const composed = useMemo(() => {
    if (!onPlayerMove && !onShoot) {
      return null
    }

    // Pan gesture for moving player
    const pan = Gesture.Pan()
      .onBegin((e) => {
        panStartX.value = e.x
        panStartY.value = e.y
        panActive.value = false // Start as false, only set true if moved significantly
      })
      .onUpdate((e) => {
        // Check if actually moved (more than 8 pixels)
        const dx = Math.abs(e.x - panStartX.value)
        const dy = Math.abs(e.y - panStartY.value)
        const moved = dx > 8 || dy > 8
        
        if (moved) {
          panActive.value = true
        }
        
        // Only move player if we've determined this is a drag
        if (panActive.value && onPlayerMove) {
          runOnJS(onPlayerMove)(e.x)
        }
      })
      .onFinalize(() => {
        // Reset after a small delay to allow tap to check
        'worklet'
        panActive.value = false
      })
      .minDistance(8) // Require 8px movement before pan activates

    // Tap gesture for shooting
    const tap = Gesture.Tap()
      .onTouchesDown((e) => {
        'worklet'
        // Store tap start position
        if (e.allTouches.length > 0) {
          tapStartX.value = e.allTouches[0].x
          tapStartY.value = e.allTouches[0].y
        }
      })
      .maxDistance(12) // Allow some movement for tap
      .maxDuration(250) // Quick tap
      .onEnd((e) => {
        'worklet'
        // Check if this was actually a tap (minimal movement)
        const dx = Math.abs(e.x - tapStartX.value)
        const dy = Math.abs(e.y - tapStartY.value)
        const movedTooMuch = dx > 12 || dy > 12
        
        // Only shoot if it's a tap (not a drag)
        // Don't check panActive - just check movement distance
        if (!movedTooMuch && onShoot) {
          runOnJS(onShoot)()
        }
      })

    // Compose gestures to work simultaneously
    return Gesture.Simultaneous(pan, tap)
  }, [onPlayerMove, onShoot, panActive, panStartX, panStartY, tapStartX, tapStartY])

  // Determine if gestures are active (only when callbacks are provided)
  const gesturesActive = !!(onPlayerMove || onShoot)

  const gameView = (
    <View
      style={{
        width,
        height,
        backgroundColor: 'rgba(10, 10, 18, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.35)',
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
      pointerEvents={gesturesActive ? "box-only" : "auto"}
    >
      {/* Vignette overlay */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
        }}
      />
      
      {/* Hint pill */}
      {showHint && (onPlayerMove || onShoot) && (
        <Animated.View
          style={[
            styles.hintPill,
            {
              opacity: hintOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.hintText}>Drag to move • Tap to shoot</Text>
        </Animated.View>
      )}
      
      {/* Player hit flash overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 60, 60, 0.10)',
            opacity: hitFlashOpacity,
          },
        ]}
        pointerEvents="none"
      />
      
      {children}
    </View>
  )

  // Only wrap with GestureDetector if gestures are active
  // When gestures are disabled, overlays need to receive touches
  if (composed && gesturesActive) {
    return <GestureDetector gesture={composed}>{gameView}</GestureDetector>
  }

  return gameView
}

const styles = StyleSheet.create({
  hintPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    zIndex: 100,
  },
  hintText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
})

