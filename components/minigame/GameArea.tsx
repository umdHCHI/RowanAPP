import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSharedValue, runOnJS } from 'react-native-reanimated'
import type { ReactNode } from 'react'

interface GameAreaProps {
  width: number
  height: number
  children: ReactNode
  onPlayerMove?: (x: number) => void
  onShoot?: () => void
  shootCooldownMs?: number
  playerLastHitAt?: number
  isTutorial?: boolean
}

export function GameArea({
  width,
  height,
  children,
  onPlayerMove,
  onShoot,
  shootCooldownMs = 0,
  playerLastHitAt,
  isTutorial = false,
}: GameAreaProps) {
  // Use shared values for gesture state (no re-renders)
  const panActive = useSharedValue(false)
  const panStartX = useSharedValue(0)
  const panStartY = useSharedValue(0)
  const tapStartX = useSharedValue(0)
  const tapStartY = useSharedValue(0)
  const lastSentX = useSharedValue(-9999)
  const callbacksEnabled = useSharedValue(false)
  const lastShootAt = useSharedValue(0)
  const shootCooldownMsRef = useSharedValue(shootCooldownMs)
  
  // Store callbacks in refs to prevent gesture recreation on every render
  const onPlayerMoveRef = useRef(onPlayerMove)
  const onShootRef = useRef(onShoot)
  
  // Keep callback refs and callbacksEnabled in sync. We mutate callbacksEnabled here (not in
  // useMemo deps) so the gesture worklet reads the current value at runtime without recreating
  // the gesture when onPlayerMove/onShoot change. The gesture stays stable; only this effect runs.
  useEffect(() => {
    onPlayerMoveRef.current = onPlayerMove
    onShootRef.current = onShoot
    callbacksEnabled.value = !!(onPlayerMove || onShoot)
    shootCooldownMsRef.value = shootCooldownMs
  }, [onPlayerMove, onShoot, shootCooldownMs, callbacksEnabled, shootCooldownMsRef])
  
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
  const lastHitAtRef = useRef<number | undefined>(undefined)

  // Tutorial hints for level 0
  const tutorialHints = useMemo(() => [
    'Drag anywhere on the screen to move the bow',
    'Tap anywhere on the screen to shoot the enemies',
    'Shoot the bullets to destroy obstacles',
    'Destroy enemy targets to collect powerups and explore thought patterns',
    'Destroy the incoming waves to fullfill your contract and help clear The Archive from its rot.',
    'Gather Lumens to help you repair the rifts.',
  ], [])
  const [currentTutorialHintIndex, setCurrentTutorialHintIndex] = useState(0)
  const [showTutorialHint, setShowTutorialHint] = useState(false)
  const tutorialHintOpacity = useMemo(() => new Animated.Value(0), [])
  const tutorialTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const tutorialActiveRef = useRef<boolean>(false)

  function clearAllTutorialTimers() {
    tutorialTimersRef.current.forEach((id) => clearTimeout(id))
    tutorialTimersRef.current = []
  }

  function registerTutorialTimer(id: ReturnType<typeof setTimeout>) {
    tutorialTimersRef.current.push(id)
  }

  // Memoized function to show tutorial hints in sequence
  const showTutorialHintAtIndex = useCallback((index: number) => {
    if (!tutorialActiveRef.current) return

    if (index >= tutorialHints.length) {
      Animated.timing(tutorialHintOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (tutorialActiveRef.current) setShowTutorialHint(false)
      })
      return
    }

    setCurrentTutorialHintIndex(index)

    Animated.timing(tutorialHintOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!tutorialActiveRef.current) return

      const showTimer = setTimeout(() => {
        if (!tutorialActiveRef.current) return
        Animated.timing(tutorialHintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (!tutorialActiveRef.current) return
          const nextTimer = setTimeout(() => {
            if (tutorialActiveRef.current) {
              showTutorialHintAtIndex(index + 1)
            }
          }, 200)
          registerTutorialTimer(nextTimer)
        })
      }, 10000)
      registerTutorialTimer(showTimer)
    })
  }, [tutorialHints.length, tutorialHintOpacity])

  // Show tutorial hints in sequence when tutorial mode is active
  useEffect(() => {
    if (!isTutorial) {
      tutorialActiveRef.current = false
      clearAllTutorialTimers()
      setShowTutorialHint(false)
      setCurrentTutorialHintIndex(0)
      tutorialHintOpacity.setValue(0)
      return
    }

    tutorialActiveRef.current = true

    const startTimer = setTimeout(() => {
      if (tutorialActiveRef.current) {
        setShowTutorialHint(true)
        showTutorialHintAtIndex(0)
      }
    }, 1000)
    registerTutorialTimer(startTimer)

    return () => {
      tutorialActiveRef.current = false
      clearAllTutorialTimers()
    }
  }, [isTutorial, tutorialHintOpacity, showTutorialHintAtIndex])

  // Fade out regular hint after 3 seconds (only if not in tutorial mode)
  useEffect(() => {
    if (showHint && !isTutorial) {
      const timer = setTimeout(() => {
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowHint(false))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showHint, hintOpacity, isTutorial])

  // Handle player hit flash: only when we have a new, valid hit timestamp. Treat 0/undefined as
  // "no hit" so we never flash on initial mount or when the parent resets to 0.
  useEffect(() => {
    const hasNewHit =
      playerLastHitAt != null &&
      playerLastHitAt > 0 &&
      playerLastHitAt !== lastHitAtRef.current
    if (hasNewHit) {
      lastHitAtRef.current = playerLastHitAt
      hitFlashOpacity.setValue(1)
      Animated.timing(hitFlashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [playerLastHitAt, hitFlashOpacity])

  // Stable gesture: handlePlayerMove/handleShoot are stable (useCallback []); shared values are
  // stable refs. callbacksEnabled is not in the dependency array—it is mutated in the effect
  // above so worklets always read the current value; including it would not change behavior
  // (shared value identity is stable) but we keep the gesture deps minimal on purpose.
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
  
    // Tap gesture for shooting - prioritize tap over pan for shooting
    // Use Race so tap can fire even during pan if it's quick enough
    const tap = Gesture.Tap()
      .onTouchesDown((e) => {
        'worklet'
        if (e.allTouches.length > 0) {
          tapStartX.value = e.allTouches[0].x
          tapStartY.value = e.allTouches[0].y
        }
      })
      .maxDistance(16) // Slightly more lenient for phone taps
      .maxDuration(300) // Slightly longer duration for phone taps
      .onEnd((e) => {
        'worklet'
        if (!callbacksEnabled.value) return

        const dx = Math.abs(e.x - tapStartX.value)
        const dy = Math.abs(e.y - tapStartY.value)
        const movedTooMuch = dx > 16 || dy > 16

        // Only block if moved significantly (more than tap threshold) AND pan is definitely active
        // Allow taps to fire even if pan started, as long as movement was minimal
        if (!movedTooMuch) {
          const now = Date.now()
          if (now - lastShootAt.value >= shootCooldownMsRef.value) {
            lastShootAt.value = now
            runOnJS(handleShoot)()
          }
        }
      })

    // Use Race so tap can fire immediately before pan activates
    // This allows rapid taps to fire even during drag operations
    return Gesture.Race(tap, pan)
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
    lastShootAt,
    shootCooldownMsRef,
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
      
      {/* Regular hint pill (only show if not in tutorial mode) */}
      {showHint && (onPlayerMove || onShoot) && !isTutorial && (
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

      {/* Tutorial hints (centered, shown in sequence) */}
      {showTutorialHint && isTutorial && (
        <Animated.View
          style={[
            styles.tutorialHintContainer,
            {
              opacity: tutorialHintOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.tutorialHintCard}>
            <Text style={styles.tutorialHintText}>
              {tutorialHints[currentTutorialHintIndex]}
            </Text>
          </View>
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
    top: 56,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  hintText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
  },
  tutorialHintContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
    zIndex: 200,
  },
  tutorialHintCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    maxWidth: '85%',
    minWidth: 280,
  },
  tutorialHintText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
})

