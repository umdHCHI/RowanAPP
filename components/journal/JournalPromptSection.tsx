import { View, Text as RNText, StyleSheet, ActivityIndicator } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { JournalPrompt } from '@/stores/game-store'

interface JournalPromptSectionProps {
  currentPrompt: JournalPrompt | null
  isLoading: boolean
  error: Error | null
}

export function JournalPromptSection({
  currentPrompt,
  isLoading,
  error,
}: JournalPromptSectionProps) {
  const theme = useTheme()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading prompts...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyMedium" style={styles.errorText}>
          Failed to load prompts. Please try again.
        </Text>
      </View>
    )
  }

  if (!currentPrompt) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No prompts available at this time.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.cardContainer}>
      {/* Card */}
      <View style={styles.card}>
        {/* Category */}
        <RNText style={styles.cardCategory}>
          {currentPrompt.category.toUpperCase()}
        </RNText>

        {/* Prompt text */}
        <View style={styles.promptTextContainer}>
          <RNText style={styles.promptText}>
            {currentPrompt.text}
          </RNText>
        </View>

        {/* Awards */}
        <View style={styles.awardsContainer}>
          <RNText style={styles.awardsText}>+1 Attribute</RNText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
  },
  cardCategory: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptTextContainer: {
    minHeight: 80,
    justifyContent: 'center',
    marginBottom: 16,
  },
  awardsContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  awardsText: {
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
  promptText: {
    fontFamily: 'VT323-Regular',
    fontSize: 22,
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 26,
    letterSpacing: 0.6,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#F44336',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
})
