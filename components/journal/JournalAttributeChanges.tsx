import { View } from 'react-native'
import { useMyCharacter } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { journalAttributeStyles } from '@/styles/journal/journal-styles'
import { Text } from '@/components/ui'


export function JournalAttributeChanges() {
  const { data: myCharacter } = useMyCharacter()
  const storeLumens = useGameStore((state) => state.lumens.lumens)
  const displayLumens = myCharacter?.experience ?? storeLumens

  return (
    <View style={journalAttributeStyles.attributeChangesContainer}>
      <Text variant="label" size={2} align="center">+1 Lumens</Text>
      <Text variant="label" size={2} align="center">Total {displayLumens} helping you seal the Void</Text>
      
    </View>
  )
}



