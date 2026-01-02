import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { GameButton } from '@/components/GameButton'

interface JournalSaveButtonProps {
  isSaved: boolean
  isSaving: boolean
  onPress: () => void
}

export function JournalSaveButton({ isSaved, isSaving, onPress }: JournalSaveButtonProps) {
  const theme = useTheme()

  return (
    <View className={`items-center mb-3 ${isSaved || isSaving ? 'opacity-60' : 'opacity-100'}`}>
      {isSaving ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : (
        <GameButton
          normalImage={require('../../assets/UI/buttons/blue/Button_05A_Normal.png')}
          selectedImage={require('../../assets/UI/buttons/blue/Button_05A_Pressed.png')}
          pressedImage={require('../../assets/UI/buttons/blue/Button_05A_Pressed.png')}
          label={isSaved ? 'Saved!' : 'Save Entry'}
          onPress={onPress}
          width={200}
          height={50}
        />
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
})

