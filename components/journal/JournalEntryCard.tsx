import { Card, Text, TextInput, useTheme } from 'react-native-paper'

interface JournalEntryCardProps {
  value: string
  onChangeText: (text: string) => void
  disabled?: boolean
}

export function JournalEntryCard({ value, onChangeText, disabled }: JournalEntryCardProps) {
  const theme = useTheme()

  return (
    <Card
      className="mb-6 border"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.outline,
        borderRadius: theme.roundness * 1.33,
      }}
      elevation={2}
    >
      <Card.Content className="p-5">
        <Text variant="labelLarge" className="mb-3">
          Reflect on your journey
        </Text>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={8}
          placeholder="Write your thoughts here..."
          value={value}
          onChangeText={onChangeText}
          className="min-h-[200px]"
          style={{
            backgroundColor: theme.colors.surfaceVariant,
          }}
          contentStyle={{
            color: theme.colors.onSurface,
            lineHeight: 24,
          }}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          disabled={disabled}
        />
      </Card.Content>
    </Card>
  )
}

