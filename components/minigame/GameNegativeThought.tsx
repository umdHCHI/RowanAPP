import { View, Image, Animated } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import { useFadeIn } from '@/utils/useFadeIn'
import type { NegativeThought } from '@/types/game'

interface GameNegativeThoughtProps {
  thought: NegativeThought
}

export function GameNegativeThought({ thought }: GameNegativeThoughtProps) {
  const fadeIn = useFadeIn(200)

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: thought.x,
        top: thought.y,
        width: GAME_CONFIG.THOUGHT_WIDTH,
        height: GAME_CONFIG.THOUGHT_HEIGHT,
        opacity: fadeIn,
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
    </Animated.View>
  )
}

