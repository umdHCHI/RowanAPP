import { useMemo } from 'react'
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import type { ConqueredThought } from '@/types/game'
import { Button, Text as UiText } from '@/components/ui'

interface GameOverDialogProps {
  visible: boolean
  score: number
  won: boolean
  bossDefeated: boolean
  lumensAwarded: number
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
  lumensAwarded,
  conqueredThoughts,
  defeatedNegativeThoughts = [],
  onDismiss,
  onPlayAgain,
  onBackToHub,
}: GameOverDialogProps) {
  const playPageFlipSound = usePageFlipSound()
  const insets = useSafeAreaInsets()

  const conqueredKey = conqueredThoughts.map((c) => c.id).join(',')
  const defeatedKey = defeatedNegativeThoughts.map((t) => t.id).join(',')
  const oneReframed = useMemo(() => {
    if (conqueredThoughts.length === 0) return null
    const i = Math.floor(Math.random() * conqueredThoughts.length)
    return conqueredThoughts[i]
  }, [conqueredKey, conqueredThoughts])
  const oneDefeated = useMemo(() => {
    if (defeatedNegativeThoughts.length === 0) return null
    const i = Math.floor(Math.random() * defeatedNegativeThoughts.length)
    return defeatedNegativeThoughts[i]
  }, [defeatedKey, defeatedNegativeThoughts])

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
        {lumensAwarded > 0 ? (
          <Text style={styles.lumensText}>Lumens Gathered: {lumensAwarded}</Text>
        ) : (
          <Text style={styles.noLumensText}>No Lumens Gathered</Text>
        )}
        {bossDefeated && (
          <Text style={styles.bossText}>Boss Defeated!</Text>
        )}
        {(conqueredThoughts.length > 0 || defeatedNegativeThoughts.length > 0) && (
          <View style={styles.archiveSection}>
            <Text style={styles.archiveTitle}>Archive Record</Text>

            {oneReframed && (
              <>
                <Text style={styles.thoughtCategoryTitle}>Reframed Thoughts</Text>
                <View style={styles.thoughtRecord}>
                  <Text style={styles.thoughtPhrase}>"{oneReframed.phrase}"</Text>
                  <Text style={styles.counterRecord}>{oneReframed.counterRecord}</Text>
                </View>
              </>
            )}

            {oneDefeated && (
              <>
                {oneReframed && oneDefeated && <View style={styles.thoughtDivider} />}
                <Text style={styles.thoughtCategoryTitle}>Defeated Thoughts</Text>
                <View style={styles.thoughtRecord}>
                  <Text style={styles.thoughtPhrase}>"{oneDefeated.phrase}"</Text>
                  <Text style={styles.counterRecord}>{oneDefeated.counterRecord}</Text>
                </View>
              </>
            )}
          </View>
        )}
        <View style={styles.buttonRow}>
          <View style={styles.buttonSlot}>
            <Button variant="secondary" size="small" onPress={handleBackToHub} fullWidth hapticType="light">
              <UiText variant="title" size={1} align="center">Back to Archive</UiText>
            </Button>
          </View>
          <View style={styles.buttonSlot}>
            <Button variant="primary" size="small" onPress={handlePlayAgain} fullWidth hapticType="light">
              <UiText variant="title" size={1} align="center">Play Again</UiText>
            </Button>
          </View>
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
  lumensText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  noLumensText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 16,
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
    justifyContent: 'center',
  },
  buttonSlot: {
    flex: 1,
  },
})
