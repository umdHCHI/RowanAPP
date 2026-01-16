import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { EnemyProjectile } from '@/types/game'

interface GameEnemyProjectileProps {
  projectile: EnemyProjectile
}

export function GameEnemyProjectile({ projectile }: GameEnemyProjectileProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: projectile.x,
        top: projectile.y,
        width: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
        height: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200, // Above other game objects
      }}
    >
      {/* Solid bright red projectile - very visible */}
      <View
        style={{
          width: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
          height: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
          backgroundColor: '#FF4444',
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#FF8888',
          shadowColor: '#FF0000',
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
          backgroundColor: '#FF6666',
          borderRadius: 2,
        }}
        pointerEvents="none"
      />
    </View>
  )
}

