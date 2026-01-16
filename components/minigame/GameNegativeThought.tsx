import { View, Image } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { NegativeThought } from '@/types/game'

interface GameNegativeThoughtProps {
  thought: NegativeThought
}

export function GameNegativeThought({ thought }: GameNegativeThoughtProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: thought.x,
        top: thought.y,
        width: GAME_CONFIG.THOUGHT_WIDTH,
        height: GAME_CONFIG.THOUGHT_HEIGHT,
      }}
    >
      <Image
        source={require('../../assets/Vantage/negativeThought.png')}
        style={{
          width: GAME_CONFIG.THOUGHT_WIDTH,
          height: GAME_CONFIG.THOUGHT_HEIGHT,
        }}
        resizeMode="contain"
      />
    </View>
  )
}

