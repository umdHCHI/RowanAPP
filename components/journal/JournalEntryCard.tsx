import { Text as RNText, TextInput, View, StyleSheet } from 'react-native'

interface JournalEntryCardProps {
  value: string
  onChangeText: (text: string) => void
  disabled?: boolean
}

export function JournalEntryCard({ value, onChangeText, disabled }: JournalEntryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <RNText style={styles.labelText}>
          Reflect on your journey
        </RNText>
        <TextInput
          multiline
          numberOfLines={8}
          placeholder="Write your thoughts here..."
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          editable={!disabled}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 20,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
})

