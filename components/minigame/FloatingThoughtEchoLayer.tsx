import { View } from 'react-native'
import { FloatingThoughtEchoItem } from './FloatingThoughtEchoItem'
import type { ThoughtEcho } from '@/types/game'

interface FloatingThoughtEchoLayerProps {
  echoes: ThoughtEcho[]
  gameWidth: number
  gameHeight: number
  onEchoDone: (id: string) => void
}

export function FloatingThoughtEchoLayer({
  echoes,
  gameWidth,
  gameHeight,
  onEchoDone,
}: FloatingThoughtEchoLayerProps) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {echoes.map((echo) => (
        <FloatingThoughtEchoItem
          key={echo.id}
          id={echo.id}
          text={echo.text}
          x={echo.x}
          y={echo.y}
          gameWidth={gameWidth}
          gameHeight={gameHeight}
          onDone={onEchoDone}
        />
      ))}
    </View>
  )
}

