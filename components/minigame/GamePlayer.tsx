import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'

interface GamePlayerProps {
  x: number
  y: number
  shieldActive?: boolean
}

const SHIELD_COLOR = 'rgba(212, 175, 55, 0.9)' // Gold color matching game theme

export function GamePlayer({ x, y, shieldActive = false }: GamePlayerProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: GAME_CONFIG.PLAYER_WIDTH,
        height: GAME_CONFIG.PLAYER_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {shieldActive && (
        <View
          style={{
            position: 'absolute',
            width: GAME_CONFIG.PLAYER_WIDTH + 10,
            height: GAME_CONFIG.PLAYER_HEIGHT + 10,
            borderRadius: (GAME_CONFIG.PLAYER_WIDTH + 10) / 2,
            borderWidth: 2,
            borderColor: SHIELD_COLOR,
            opacity: 0.6,
          }}
        />
      )}
      <Image
        source={require('../../assets/Vantage/user.png')}
        style={{
          width: GAME_CONFIG.PLAYER_WIDTH,
          height: GAME_CONFIG.PLAYER_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

