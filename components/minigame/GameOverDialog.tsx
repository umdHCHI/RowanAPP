import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import type { ConqueredThought } from '@/types/game'

interface GameOverDialogProps {
  visible: boolean
  score: number
  won: boolean
  bossDefeated: boolean
  conqueredThoughts: ConqueredThought[]
  defeatedNegativeThoughts?: ConqueredThought[]
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
  defeatedNegativeThoughts = [],
  onDismiss,
  onPlayAgain,
  onBackToHub,
}: GameOverDialogProps) {
  const playPageFlipSound = usePageFlipSound()
  const insets = useSafeAreaInsets()

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
        {(conqueredThoughts.length > 0 || defeatedNegativeThoughts.length > 0) && (
          <View style={styles.archiveSection}>
            <Text style={styles.archiveTitle}>Archive Record</Text>
            
            {/* Positive thoughts (conquered/reframed) */}
            {conqueredThoughts.length > 0 && (
              <>
                {conqueredThoughts.length > 0 && (
                  <Text style={styles.thoughtCategoryTitle}>Reframed Thoughts</Text>
                )}
                {conqueredThoughts.slice(0, 5).map((thought) => (
                  <View key={`positive-${thought.id}`} style={styles.thoughtRecord}>
                    <Text style={styles.thoughtPhrase}>"{thought.phrase}"</Text>
                    <Text style={styles.counterRecord}>{thought.counterRecord}</Text>
                  </View>
                ))}
              </>
            )}
            
            {/* Negative thoughts (defeated) */}
            {defeatedNegativeThoughts.length > 0 && (
              <>
                {conqueredThoughts.length > 0 && defeatedNegativeThoughts.length > 0 && (
                  <View style={styles.thoughtDivider} />
                )}
                {defeatedNegativeThoughts.length > 0 && (
                  <Text style={styles.thoughtCategoryTitle}>Defeated Thoughts</Text>
                )}
                {defeatedNegativeThoughts.slice(0, 5).map((thought) => (
                  <View key={`negative-${thought.id}`} style={styles.thoughtRecord}>
                    <Text style={styles.thoughtPhrase}>"{thought.phrase}"</Text>
                    <Text style={styles.counterRecord}>{thought.counterRecord}</Text>
                  </View>
                ))}
              </>
            )}
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
            <Text style={styles.secondaryButtonText}>Play Again</Text>
          </Pressable>
        </View>
      </View>
    </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    maxWidth: 340,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  scoreText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 8,
  },
  bossText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 20,
  },
  archiveSection: {
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  archiveTitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 12,
  },
  thoughtRecord: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  thoughtPhrase: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
    opacity: 0.9,
  },
  counterRecord: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#ffffffaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  thoughtCategoryTitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  thoughtDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  primaryButton: {
    borderColor: '#ffffff',
    backgroundColor: '#15111f',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: '#15111f',
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})
