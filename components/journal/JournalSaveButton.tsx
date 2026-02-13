import { View, ActivityIndicator, TouchableOpacity } from 'react-native'


import { JournalSaveButtonProps } from '@/types/journal/journal'
import { Text } from '@/components/ui'
import { journalSaveButtonStyles } from '@/styles/journal/journal-styles'

export function JournalSaveButton({ isSaved, isSaving, onPress, haptics, pageFlipSound }: JournalSaveButtonProps) {
   
    
  return (
    <View className={`items-center mb-3 ${isSaved || isSaving ? 'opacity-60' : 'opacity-100'}`}>
      {isSaving ? (
        <View style={journalSaveButtonStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            pageFlipSound()
            haptics()
            onPress()
          }}
          disabled={isSaved || isSaving}
          style={[journalSaveButtonStyles.saveButton, (isSaved || isSaving) && journalSaveButtonStyles.saveButtonDisabled]}
        >
          <Text variant="label" size={2} align="center">
            {isSaved ? 'Saved!' : 'Save Entry'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
