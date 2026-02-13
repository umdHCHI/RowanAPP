import {  TextInput, View } from 'react-native'
import { journalEntryCardStyles } from '@/styles/journal/journal-styles'
import { JournalEntryCardProps } from '@/types/journal/journal'
import { Text } from '@/components/ui'

export function JournalEntryCard({ value, onChangeText, disabled }: JournalEntryCardProps) {
  return (
    <View style={journalEntryCardStyles.card}>
      <View style={journalEntryCardStyles.cardContent}>
        <Text variant="label" size={2} align="center">
          Reflect on your journey
        </Text>
        <TextInput
          multiline
          numberOfLines={8}
          placeholder="Write your thoughts here..."
          value={value}
          onChangeText={onChangeText}
          style={journalEntryCardStyles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          editable={!disabled}
        />
      </View>
    </View>
  )
}

