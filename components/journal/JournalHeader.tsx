import { Text as RNText, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

interface JournalHeaderProps {
  characterName?: string | null
}

export function JournalHeader({ characterName }: JournalHeaderProps) {
  return (
    <>
      <RNText
        className="text-center mb-2 text-3xl tracking-wider font-display"
        style={styles.title}
      >
        Your Journal
      </RNText>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Welcome back, {characterName || 'Scholar'}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 34,
    letterSpacing: 1.5,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
})

