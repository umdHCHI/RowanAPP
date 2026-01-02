import { View, Text, Pressable, StyleSheet } from 'react-native'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import type { ConqueredThought } from '@/types/game'

interface GameOverDialogProps {
  visible: boolean
  score: number
  won: boolean
  bossDefeated: boolean
  conqueredThoughts: ConqueredThought[]
  onDismiss: () => void
  onPlayAgain: () => void
  onBackToHub: () => void
}

export function GameOverDialog({
  visible,
  score,
  won,
  bossDefeated,
  conqueredThoughts,
  onDismiss,
  onPlayAgain,
  onBackToHub,
}: GameOverDialogProps) {
  const playPageFlipSound = usePageFlipSound()

  if (!visible) return null

  function handlePlayAgain() {
    playPageFlipSound()
    onPlayAgain()
  }

  function handleBackToHub() {
    playPageFlipSound()
    onBackToHub()
  }

  function handleDismiss() {
    playPageFlipSound()
    onDismiss()
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <View style={styles.card}>
        <Text style={styles.title}>{won ? 'Victory!' : 'Game Over'}</Text>
        {won && bossDefeated && (
          <Text style={styles.subtitle}>You've sealed the breach.</Text>
        )}
        {!won && (
          <Text style={styles.subtitle}>
            You've practiced reframing negative thoughts!
          </Text>
        )}
        <Text style={styles.scoreText}>Final Score: {score}</Text>
        {bossDefeated && (
          <Text style={styles.bossText}>Boss Defeated!</Text>
        )}
        {conqueredThoughts.length > 0 && (
          <View style={styles.archiveSection}>
            <Text style={styles.archiveTitle}>Archive Record</Text>
            {conqueredThoughts.slice(0, 3).map((thought) => (
              <View key={thought.id} style={styles.thoughtRecord}>
                <Text style={styles.thoughtPhrase}>"{thought.phrase}"</Text>
                <Text style={styles.counterRecord}>{thought.counterRecord}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBackToHub}
          >
            <Text style={styles.secondaryButtonText}>Back to Archive</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    padding: 24,
    maxWidth: 340,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  scoreText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 20,
    color: 'rgba(212, 175, 55, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  bossText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(212, 175, 55, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  archiveSection: {
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  archiveTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: 'rgba(212, 175, 55, 0.7)',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  thoughtRecord: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  thoughtPhrase: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 15,
    color: 'rgba(245, 245, 245, 0.92)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  counterRecord: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  primaryButton: {
    borderColor: 'rgba(212, 175, 55, 0.6)',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(212, 175, 55, 0.9)',
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
})
