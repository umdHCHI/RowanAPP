import { View, TouchableOpacity} from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { JournalModeSelectorProps } from '@/types/journal/journal'
import { Text } from '@/components/ui'
import { journalModeSelectorStyles } from '@/styles/journal/journal-styles'
import { colors } from '@/theme/design-tokens'


export function JournalModeSelector({ mode, onModeChange }: JournalModeSelectorProps) {
  return (
    <View style={journalModeSelectorStyles.container}>
      <TouchableOpacity
        style={[journalModeSelectorStyles.modeButton, mode === 'journal' && journalModeSelectorStyles.modeButtonActive]}
        onPress={() => onModeChange('journal')}
      >
        <MaterialDesignIcons
          name="pencil"
          size={20}
          color={mode === 'journal' ? colors.archive.white : colors.archive.borderSubtle}
        />
        <Text variant="label" size={2} align="center">
          journal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[journalModeSelectorStyles.modeButton, mode === 'draw' && journalModeSelectorStyles.modeButtonActive]}
        onPress={() => onModeChange('draw')}
      >
        <MaterialDesignIcons
          name="brush"
          size={20}
          color={mode === 'draw' ? colors.archive.white : colors.archive.borderSubtle}
        />
        <Text variant="label" size={2} align="center">
          Draw
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[journalModeSelectorStyles.modeButton, mode === 'voice' && journalModeSelectorStyles.modeButtonActive]}
        onPress={() => onModeChange('voice')}
      >
        <MaterialDesignIcons
          name="microphone"
          size={20}
          color={mode === 'voice' ? colors.archive.white : colors.archive.borderSubtle}
        />
        <Text variant="label" size={2} align="center">
          Voice
        </Text>
      </TouchableOpacity>
    </View>
  )
}
