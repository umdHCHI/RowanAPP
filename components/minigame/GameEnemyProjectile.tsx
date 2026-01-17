import { useEffect, useRef } from 'react'
import { View, Image, Animated } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { EnemyProjectile } from '@/types/game'

interface GameEnemyProjectileProps {
  projectile: EnemyProjectile
}

export function GameEnemyProjectile({ projectile }: GameEnemyProjectileProps) {
  const fadeIn = useRef(new Animated.Value(0)).current
  const hasAnimatedInRef = useRef(false)

  // Fade in on first render to prevent double-render flash
  useEffect(() => {
    if (!hasAnimatedInRef.current) {
      hasAnimatedInRef.current = true
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start()
    }
  }, [fadeIn])

  // Use purple colors for boss projectiles, red for regular enemy projectiles
  const isBoss = projectile.isBoss ?? false
  const backgroundColor = isBoss ? '#AA44FF' : '#FF4444'
  const borderColor = isBoss ? '#CC88FF' : '#FF8888'
  const shadowColor = isBoss ? '#9933FF' : '#FF0000'
  const innerColor = isBoss ? '#BB66FF' : '#FF6666'

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: projectile.x,
        top: projectile.y,
        width: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
        height: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeIn,
        zIndex: 200, // Above other game objects
      }}
    >
      {/* Solid bright projectile - very visible */}
      <View
        style={{
          width: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
          height: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
          backgroundColor,
          borderRadius: 4,
          borderWidth: 2,
          borderColor,
          shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 5, // Android shadow
        }}
      />
      {/* Inner bright core */}
      <View
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          backgroundColor: innerColor,
          borderRadius: 2,
        }}
        pointerEvents="none"
      />
    </Animated.View>
  )
}

