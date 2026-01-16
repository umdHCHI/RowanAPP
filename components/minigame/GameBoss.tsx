import { useEffect, useRef } from 'react'
import { View, Image, Animated, Text, StyleSheet } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { Boss } from '@/types/game'

interface GameBossProps {
  boss: Boss
  lastHitAt?: number
  telegraphActive?: boolean
  telegraphLabel?: string
  difficultyLevel?: number // 1-10 from useGameDirector
}

export function GameBoss({ boss, lastHitAt, telegraphActive, telegraphLabel, difficultyLevel = 5 }: GameBossProps) {
  const flash = useRef(new Animated.Value(0)).current
  const shake = useRef(new Animated.Value(0)).current
  const telegraphGlow = useRef(new Animated.Value(0)).current
  const lastHitAtRef = useRef<number | undefined>(undefined)

  // Calculate inverseDifficulty factor for adaptive pacing
  // Lower difficultyLevel (1) = higher pressure = slower animations, more visible telegraph
  // Higher difficultyLevel (10) = lower pressure = faster animations, less visible telegraph
  const inverseDifficulty = (11 - difficultyLevel) * 0.2
  const baseTelegraphDuration = 225
  const adaptiveTelegraphDuration = baseTelegraphDuration * inverseDifficulty

  // Telegraph opacity adjustment: Lower difficulty (high pressure) = more visible warning
  // Base range: [0.1, 0.18], adjust based on difficulty
  const opacityBoost = difficultyLevel <= 3 ? 0.08 : 0 // Boost opacity when difficulty is low (high pressure)
  const telegraphOpacityMin = 0.1 + opacityBoost
  const telegraphOpacityMax = 0.18 + opacityBoost

  // Shake intensity: Lower difficulty = subtler shake
  const shakeIntensity = Math.max(1, difficultyLevel * 0.4) // Range: 1 (difficulty 1-2) to 4 (difficulty 10)

  useEffect(() => {
    if (lastHitAt !== undefined && lastHitAt !== lastHitAtRef.current) {
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
  }, [lastHitAt, flash, shake])

  // Telegraph glow animation - adaptive timing based on difficulty
  useEffect(() => {
    if (telegraphActive) {
      // Start pulsing animation with adaptive duration
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(telegraphGlow, {
            toValue: 1,
            duration: adaptiveTelegraphDuration,
            useNativeDriver: true,
          }),
          Animated.timing(telegraphGlow, {
            toValue: 0,
            duration: adaptiveTelegraphDuration,
            useNativeDriver: true,
          }),
        ])
      )
      pulseAnimation.start()
      return () => pulseAnimation.stop()
    } else {
      // Fade out quickly
      Animated.timing(telegraphGlow, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start()
    }
  }, [telegraphActive, telegraphGlow, adaptiveTelegraphDuration])

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
            backgroundColor: 'rgba(212, 175, 55, 0.85)',
          }}
        />
      </View>
      
      {/* Boss image container */}
      <View
        style={{
          width: GAME_CONFIG.BOSS_WIDTH,
          height: GAME_CONFIG.BOSS_HEIGHT,
          borderWidth: 1,
          borderColor: 'rgba(212, 175, 55, 0.25)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: 14,
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
            borderRadius: 14,
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
            backgroundColor: 'rgba(212, 175, 55, 0.18)',
            borderRadius: 14,
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
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: 'rgba(212, 175, 55, 0.9)',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
})

