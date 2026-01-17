import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export type ReflectionMode = 'journal' | 'draw' | 'voice'

interface JournalModeSelectorProps {
  mode: ReflectionMode
  onModeChange: (mode: ReflectionMode) => void
}

export function JournalModeSelector({ mode, onModeChange }: JournalModeSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'journal' && styles.modeButtonActive]}
        onPress={() => onModeChange('journal')}
      >
        <MaterialCommunityIcons
          name="pencil"
          size={20}
          color={mode === 'journal' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
        />
        <Text style={[styles.modeButtonText, mode === 'journal' && styles.modeButtonTextActive]}>
          journal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeButton, mode === 'draw' && styles.modeButtonActive]}
        onPress={() => onModeChange('draw')}
      >
        <MaterialCommunityIcons
          name="brush"
          size={20}
          color={mode === 'draw' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
        />
        <Text style={[styles.modeButtonText, mode === 'draw' && styles.modeButtonTextActive]}>
          Draw
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeButton, mode === 'voice' && styles.modeButtonActive]}
        onPress={() => onModeChange('voice')}
      >
        <MaterialCommunityIcons
          name="microphone"
          size={20}
          color={mode === 'voice' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
        />
        <Text style={[styles.modeButtonText, mode === 'voice' && styles.modeButtonTextActive]}>
          Voice
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  modeButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
})

