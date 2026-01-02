import { View, Image } from 'react-native'
import { useTheme } from 'react-native-paper'
import { GAME_CONFIG } from '@/utils/thought-defender-constants'

interface GamePlayerProps {
  x: number
  y: number
  shieldActive?: boolean
}

export function GamePlayer({ x, y, shieldActive = false }: GamePlayerProps) {
  const theme = useTheme()

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
            borderColor: theme.colors.primary,
            opacity: 0.6,
          }}
        />
      )}
      <Image
        source={require('../../assets/thoughtDefender/user.png')}
        style={{
          width: GAME_CONFIG.PLAYER_WIDTH,
          height: GAME_CONFIG.PLAYER_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

