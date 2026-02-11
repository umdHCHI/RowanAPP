import { useEffect, useMemo, useRef } from 'react'
import { View, Image, Animated, Text, StyleSheet } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { Boss } from '@/types/game'

interface GameBossProps {
  boss: Boss
  telegraphActive?: boolean
  telegraphLabel?: string
  difficultyLevel?: number // 1-10 from useGameDirector
}

export function GameBoss({ boss, telegraphActive, telegraphLabel, difficultyLevel = 5 }: GameBossProps) {
  const flash = useRef(new Animated.Value(0)).current
  const shake = useRef(new Animated.Value(0)).current
  const telegraphGlow = useRef(new Animated.Value(0)).current
  const fadeIn = useRef(new Animated.Value(0)).current
  const lastHitAtRef = useRef<number | undefined>(undefined)
  const hasAnimatedInRef = useRef(false)

  // Quantize difficulty to integer steps (1–10) so telegraph pulse only restarts when
  // difficulty changes meaningfully, avoiding flicker from small DDA fluctuations.
  const difficultyStep = useMemo(
    () => Math.max(1, Math.min(10, Math.round(difficultyLevel))),
    [difficultyLevel]
  )
  const baseTelegraphDuration = 225
  const inverseDifficulty = (11 - difficultyStep) * 0.2
  const adaptiveTelegraphDuration = baseTelegraphDuration * inverseDifficulty

  // Telegraph opacity adjustment: Lower difficulty (high pressure) = more visible warning
  // Base range: [0.1, 0.18], adjust based on difficulty
  const opacityBoost = difficultyLevel <= 3 ? 0.08 : 0 // Boost opacity when difficulty is low (high pressure)
  const telegraphOpacityMin = 0.1 + opacityBoost
  const telegraphOpacityMax = 0.18 + opacityBoost

  // Shake intensity: Lower difficulty = subtler shake
  const shakeIntensity = Math.max(1, difficultyLevel * 0.4) // Range: 1 (difficulty 1-2) to 4 (difficulty 10)

  // Fade in once per mount. Parent mounts GameBoss when boss appears and unmounts when boss
  // is defeated or game resets; the boss is never unmounted/remounted during a fight, so we
  // get exactly one fade per boss appearance. No double-fade.
  useEffect(() => {
    if (!hasAnimatedInRef.current) {
      hasAnimatedInRef.current = true
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [fadeIn])

  // Only run flash/shake when we have a new, valid hit timestamp. Treat 0/undefined as "no hit".
  // Single source of truth: boss.lastHitAt (updated by game loop in use-vantage-boss).
  useEffect(() => {
    const lastHitAt = boss.lastHitAt
    const hasNewHit =
      lastHitAt != null &&
      lastHitAt > 0 &&
      lastHitAt !== lastHitAtRef.current
    if (hasNewHit) {
      lastHitAtRef.current = lastHitAt

      // Flash animation
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start()

      // Shake animation
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [boss.lastHitAt, flash, shake])

  // Telegraph glow: pulse only restarts when telegraphActive or difficultyStep (integer) changes.
  // Duration is derived from difficultyStep inside so small difficultyLevel jitter doesn't restart.
  useEffect(() => {
    if (telegraphActive) {
      const duration = baseTelegraphDuration * ((11 - difficultyStep) * 0.2)
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(telegraphGlow, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(telegraphGlow, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      )
      pulseAnimation.start()
      return () => pulseAnimation.stop()
    } else {
      Animated.timing(telegraphGlow, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start()
    }
  }, [telegraphActive, telegraphGlow, difficultyStep])

  // Adaptive shake intensity based on difficulty
  const shakeTranslateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-shakeIntensity, shakeIntensity],
  })

  // Adaptive telegraph opacity based on difficulty
  const telegraphOpacity = telegraphGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [telegraphOpacityMin, telegraphOpacityMax],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: boss.x,
        top: boss.y,
        width: GAME_CONFIG.BOSS_WIDTH,
        height: GAME_CONFIG.BOSS_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeIn,
        transform: [{ translateX: shakeTranslateX }],
      }}
    >
      {/* HP Bar */}
      <View
        style={{
          position: 'absolute',
          top: -20,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.10)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${(boss.hp / boss.maxHp) * 100}%`,
            height: '100%',
            backgroundColor: '#ffffff',
          }}
        />
      </View>
      
      {/* Boss image container */}
      <View
        style={{
          width: GAME_CONFIG.BOSS_WIDTH,
          height: GAME_CONFIG.BOSS_HEIGHT,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('../../assets/Vantage/monsterArchive.png')}
          style={{
            width: GAME_CONFIG.BOSS_WIDTH,
            height: GAME_CONFIG.BOSS_HEIGHT,
          }}
          resizeMode="contain"
        />
        
        {/* Hit flash overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 60, 60, 0.25)',
            borderRadius: 24,
            opacity: flash,
          }}
          pointerEvents="none"
        />
        
        {/* Telegraph glow overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 24,
            opacity: telegraphOpacity,
          }}
          pointerEvents="none"
        />
      </View>
      
      {/* Telegraph caption */}
      {telegraphLabel && telegraphActive && (
        <View style={styles.captionContainer} pointerEvents="none">
          <Text style={styles.captionText}>{telegraphLabel}</Text>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  captionContainer: {
    position: 'absolute',
    top: GAME_CONFIG.BOSS_HEIGHT + 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
})

