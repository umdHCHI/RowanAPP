import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
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
  // Use shared values for gesture state (no re-renders)
  const panActive = useSharedValue(false)
  const panStartX = useSharedValue(0)
  const panStartY = useSharedValue(0)
  const tapStartX = useSharedValue(0)
  const tapStartY = useSharedValue(0)
  const lastSentX = useSharedValue(-9999)
  const callbacksEnabled = useSharedValue(false)
  
  // Store callbacks in refs to prevent gesture recreation on every render
  const onPlayerMoveRef = useRef(onPlayerMove)
  const onShootRef = useRef(onShoot)
  
  // Update refs when callbacks change (without recreating gesture)
  useEffect(() => {
    onPlayerMoveRef.current = onPlayerMove
    onShootRef.current = onShoot
    callbacksEnabled.value = !!(onPlayerMove || onShoot)
  }, [onPlayerMove, onShoot, callbacksEnabled])
  
  // Create stable wrapper functions that read from refs
  // These are stable and can be used in worklets via runOnJS
  const handlePlayerMove = useCallback((x: number) => {
    onPlayerMoveRef.current?.(x)
  }, [])
  
  const handleShoot = useCallback(() => {
    onShootRef.current?.()
  }, [])
  
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

  // Create stable gesture object using stable wrapper functions
  // Wrapper functions read from refs, so gesture doesn't need to recreate when callbacks change
  const composed = useMemo(() => {
    // Pan gesture for moving player
    const pan = Gesture.Pan()
      .onBegin((e) => {
        'worklet'
        panStartX.value = e.x
        panStartY.value = e.y
        panActive.value = false
        lastSentX.value = -9999
      })
      .onUpdate((e) => {
        'worklet'
        if (!callbacksEnabled.value) return
  
        const dx = Math.abs(e.x - panStartX.value)
        const dy = Math.abs(e.y - panStartY.value)
        const moved = dx > 8 || dy > 8
  
        if (moved) panActive.value = true
  
        if (panActive.value) {
          // Throttle: only send when x changed meaningfully (>= 12 pixels)
          if (Math.abs(e.x - lastSentX.value) >= 12) {
            lastSentX.value = e.x
            runOnJS(handlePlayerMove)(e.x)
          }
        }
      })
      .onEnd(() => {
        'worklet'
        panActive.value = false
      })
      .onFinalize(() => {
        'worklet'
        panActive.value = false
      })
      .minDistance(8)
  
    // Tap gesture for shooting - use Race so fragments can intercept first
    const tap = Gesture.Tap()
      .onTouchesDown((e) => {
        'worklet'
        if (e.allTouches.length > 0) {
          tapStartX.value = e.allTouches[0].x
          tapStartY.value = e.allTouches[0].y
        }
      })
      .maxDistance(12)
      .maxDuration(250)
      .onEnd((e) => {
        'worklet'
        if (!callbacksEnabled.value) return
  
        const dx = Math.abs(e.x - tapStartX.value)
        const dy = Math.abs(e.y - tapStartY.value)
        const movedTooMuch = dx > 12 || dy > 12
  
        if (!movedTooMuch && !panActive.value) {
          runOnJS(handleShoot)()
        }
      })
  
    return Gesture.Simultaneous(pan, tap)
  }, [
    handlePlayerMove,
    handleShoot,
    panActive,
    panStartX,
    panStartY,
    tapStartX,
    tapStartY,
    lastSentX,
    callbacksEnabled,
  ])
  

  // Determine if gestures are active (only when callbacks are provided)
  const gesturesActive = !!(onPlayerMove || onShoot)
  

  const gameView = (
    <View
      style={{
        width,
        height,
        backgroundColor: 'rgba(10, 10, 18, 0.92)',
        position: 'relative',
        overflow: 'hidden',
      }}
      pointerEvents="auto"
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
  if (gesturesActive) {
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

