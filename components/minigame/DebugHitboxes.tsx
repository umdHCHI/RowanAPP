import { View, StyleSheet } from 'react-native'
import { GAME_CONFIG, DEBUG_HITBOXES } from '@/utils/thought-defender-constants'
import type { Projectile, NegativeThought, PowerUp } from '@/types/game'

interface DebugHitboxesProps {
  playerX: number
  playerY: number
  projectiles: Projectile[]
  negativeThoughts: NegativeThought[]
  powerUps: PowerUp[]
}

export function DebugHitboxes({
  playerX,
  playerY,
  projectiles,
  negativeThoughts,
  powerUps,
}: DebugHitboxesProps) {
  if (!DEBUG_HITBOXES) {
    return null
  }

  return (
    <>
      {/* Player hitbox */}
      <View
        style={[
          styles.hitbox,
          {
            left: playerX,
            top: playerY,
            width: GAME_CONFIG.PLAYER_WIDTH,
            height: GAME_CONFIG.PLAYER_HEIGHT,
          },
        ]}
      />

      {/* Projectile hitboxes */}
      {projectiles.map((proj) => (
        <View
          key={proj.id}
          style={[
            styles.hitbox,
            {
              left: proj.x,
              top: proj.y,
              width: GAME_CONFIG.PROJECTILE_WIDTH,
              height: GAME_CONFIG.PROJECTILE_HEIGHT,
            },
          ]}
        />
      ))}

      {/* Thought hitboxes */}
      {negativeThoughts.map((thought) => (
        <View
          key={thought.id}
          style={[
            styles.hitbox,
            {
              left: thought.x,
              top: thought.y,
              width: GAME_CONFIG.THOUGHT_WIDTH,
              height: GAME_CONFIG.THOUGHT_HEIGHT,
            },
          ]}
        />
      ))}

      {/* Power-up hitboxes */}
      {powerUps.map((powerUp) => (
        <View
          key={powerUp.id}
          style={[
            styles.hitbox,
            {
              left: powerUp.x,
              top: powerUp.y,
              width: GAME_CONFIG.POWERUP_WIDTH,
              height: GAME_CONFIG.POWERUP_HEIGHT,
            },
          ]}
        />
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  hitbox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
})

