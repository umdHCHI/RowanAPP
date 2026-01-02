import { Text as RNText, StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

interface JournalHeaderProps {
  characterName?: string | null
}

export function JournalHeader({ characterName }: JournalHeaderProps) {
  const theme = useTheme()

  return (
    <>
      <RNText
        className="text-center mb-2 text-3xl tracking-wider font-display"
        style={[
          styles.title,
          {
            color: theme.colors.primary,
            textShadowColor: theme.colors.primaryContainer,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          },
        ]}
      >
        Your Journal
      </RNText>
      <Text variant="bodyMedium" className="text-center mb-10">
        Welcome back, {characterName || 'Scholar'}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    letterSpacing: 2,
  },
})

