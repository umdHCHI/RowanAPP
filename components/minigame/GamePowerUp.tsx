import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import { getPowerUpImageSource } from '@/utils/vantage-helpers'
import type { PowerUp } from '@/types/game'

interface GamePowerUpProps {
  powerUp: PowerUp
}

export function GamePowerUp({ powerUp }: GamePowerUpProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: powerUp.x,
        top: powerUp.y,
        width: GAME_CONFIG.POWERUP_WIDTH,
        height: GAME_CONFIG.POWERUP_HEIGHT,
      }}
    >
      <Image
        source={getPowerUpImageSource(powerUp.type)}
        style={{
          width: GAME_CONFIG.POWERUP_WIDTH,
          height: GAME_CONFIG.POWERUP_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

