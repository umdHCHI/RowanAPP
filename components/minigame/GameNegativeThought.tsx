import { useEffect, useRef } from 'react'
import { View, Image, Animated } from 'react-native'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { NegativeThought } from '@/types/game'

interface GameNegativeThoughtProps {
  thought: NegativeThought
}

export function GameNegativeThought({ thought }: GameNegativeThoughtProps) {
  const fadeIn = useRef(new Animated.Value(0)).current
  const hasAnimatedInRef = useRef(false)

  // Fade in on first render to prevent double-render flash
  useEffect(() => {
    if (!hasAnimatedInRef.current) {
      hasAnimatedInRef.current = true
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [fadeIn])

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

