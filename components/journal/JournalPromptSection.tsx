import { View, ActivityIndicator } from 'react-native'


import { JournalPromptSectionProps } from '@/types/journal/journal'
import { Text } from '@/components/ui'
import { journalPromptSectionStyles } from '@/styles/journal/journal-styles'

export function JournalPromptSection({
  currentPrompt,
  isLoading,
  error,
}: JournalPromptSectionProps) {
  if (isLoading) {
    return (
      <View style={journalPromptSectionStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#D4A574" />
        <Text variant="label" size={2} align="center">
          Loading prompts...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={journalPromptSectionStyles.errorContainer}>
        <Text variant="label" size={2} align="center">
          Failed to load prompts. Please try again.
        </Text>
      </View>
    )
  }

  if (!currentPrompt) {
    return (
      <View style={journalPromptSectionStyles.emptyContainer}>
        <Text variant="label" size={2} align="center">
          No prompts available at this time.
        </Text>
      </View>
    )
  }

  return (
    <View style={journalPromptSectionStyles.cardContainer}>
      {/* Card */}
      <View style={journalPromptSectionStyles.card}>
        {/* Category */}
        <Text variant="label" size={2} align="center">
          {currentPrompt.category}
        </Text>

        {/* Prompt text */}
        <View style={journalPromptSectionStyles.promptTextContainer}>
          <Text variant="label" size={2} align="center">
            {currentPrompt.text}
          </Text>
        </View>

        {/* Awards */}
        <View style={journalPromptSectionStyles.awardsContainer}>
          <Text variant="label" size={2} align="center">+1 Lumen</Text>
        </View>
      </View>
    </View>
  )
}
