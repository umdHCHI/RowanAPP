import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/thought-defender-constants'
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
        width: GAME_CONFIG.PROJECTILE_WIDTH,
        height: GAME_CONFIG.PROJECTILE_HEIGHT,
      }}
    >
      <Image
        source={require('../../assets/thoughtDefender/projectile.png')}
        style={{
          width: GAME_CONFIG.PROJECTILE_WIDTH,
          height: GAME_CONFIG.PROJECTILE_HEIGHT,
        }}
        resizeMode="contain"
      />
      {/* Red tint overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 80, 80, 0.25)',
        }}
        pointerEvents="none"
      />
    </View>
  )
}

