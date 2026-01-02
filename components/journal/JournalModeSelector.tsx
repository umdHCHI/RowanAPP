import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export type ReflectionMode = 'write' | 'draw' | 'voice'

interface JournalModeSelectorProps {
  mode: ReflectionMode
  onModeChange: (mode: ReflectionMode) => void
}

export function JournalModeSelector({ mode, onModeChange }: JournalModeSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'write' && styles.modeButtonActive]}
        onPress={() => onModeChange('write')}
      >
        <MaterialCommunityIcons
          name="pencil"
          size={20}
          color={mode === 'write' ? '#FFD700' : 'rgba(255, 255, 255, 0.6)'}
        />
        <Text style={[styles.modeButtonText, mode === 'write' && styles.modeButtonTextActive]}>
          Write
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeButton, mode === 'draw' && styles.modeButtonActive]}
        onPress={() => onModeChange('draw')}
      >
        <MaterialCommunityIcons
          name="brush"
          size={20}
          color={mode === 'draw' ? '#FFD700' : 'rgba(255, 255, 255, 0.6)'}
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
          color={mode === 'voice' ? '#FFD700' : 'rgba(255, 255, 255, 0.6)'}
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
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  modeButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modeButtonTextActive: {
    color: '#FFD700',
    fontWeight: '600',
  },
})

