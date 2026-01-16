import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { Projectile } from '@/types/game'

interface GameProjectileProps {
  projectile: Projectile
}

export function GameProjectile({ projectile }: GameProjectileProps) {
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
        source={require('../../assets/Vantage/projectile.png')}
        style={{
          width: GAME_CONFIG.PROJECTILE_WIDTH,
          height: GAME_CONFIG.PROJECTILE_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

