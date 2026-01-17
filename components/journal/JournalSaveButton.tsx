import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native'


interface JournalSaveButtonProps {
  isSaved: boolean
  isSaving: boolean
  haptics: () => void
  onPress: () => void
  pageFlipSound: () => void
}

export function JournalSaveButton({ isSaved, isSaving, onPress, haptics, pageFlipSound }: JournalSaveButtonProps) {
   
    
  return (
    <View className={`items-center mb-3 ${isSaved || isSaving ? 'opacity-60' : 'opacity-100'}`}>
      {isSaving ? (
        <View style={styles.loadingContainer}>
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
          style={[styles.saveButton, (isSaved || isSaving) && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{isSaved ? 'Saved!' : 'Save Entry'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 200,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
})

