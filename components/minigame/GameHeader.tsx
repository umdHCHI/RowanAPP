import { View, Text, Pressable, StyleSheet } from 'react-native'
import { PowerUpIndicators } from './PowerUpIndicators'

interface GameHeaderProps {
  score: number
  lives: number
  wave?: number
  bossActive?: boolean
  multishotActive?: boolean
  fastShootActive?: boolean
  shieldActive?: boolean
  onTitlePress?: () => void
}

export function GameHeader({
  score,
  lives,
  wave,
  bossActive,
  multishotActive = false,
  fastShootActive = false,
  shieldActive = false,
  onTitlePress,
}: GameHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.glassStrip}>
        {onTitlePress ? (
          <Pressable onPress={onTitlePress}>
            <Text style={styles.title}>Thought Defender</Text>
          </Pressable>
        ) : (
          <Text style={styles.title}>Thought Defender</Text>
        )}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Score: {score}</Text>
          <Text style={styles.statText}>Lives: {lives}</Text>
        </View>
        <PowerUpIndicators
          multishotActive={multishotActive}
          fastShootActive={fastShootActive}
          shieldActive={shieldActive}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
  },
  glassStrip: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '600',
  },
})

