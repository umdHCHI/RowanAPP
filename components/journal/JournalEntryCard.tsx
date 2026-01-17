import { Text as RNText, StyleSheet } from 'react-native'
import { Card, TextInput } from 'react-native-paper'

interface JournalEntryCardProps {
  value: string
  onChangeText: (text: string) => void
  disabled?: boolean
}

export function JournalEntryCard({ value, onChangeText, disabled }: JournalEntryCardProps) {
  return (
    <Card
      className="mb-6 border"
      style={styles.card}
      elevation={2}
    >
      <Card.Content className="p-5">
        <RNText style={styles.labelText}>
          Reflect on your journey
        </RNText>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={8}
          placeholder="Write your thoughts here..."
          value={value}
          onChangeText={onChangeText}
          className="min-h-[200px]"
          style={styles.input}
          contentStyle={{
            color: '#ffffff',
            lineHeight: 24,
            fontSize: 16,
          }}
          outlineColor="rgba(255, 255, 255, 0.2)"
          activeOutlineColor="#ffffff"
          textColor="#ffffff"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          disabled={disabled}
        />
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  labelText: {
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
})

