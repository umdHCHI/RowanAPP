import { View } from 'react-native'
import { useMyCharacter, useGameMyData } from '@/api'
import { useGameStore } from '@/stores/game-store'
import { journalAttributeStyles } from '@/styles/journal/journal-styles'
import { Text } from '@/components/ui'


export function JournalAttributeChanges() {
  const { data: myCharacter } = useMyCharacter()
  const { data: gameData } = useGameMyData()
  const storeLumens = useGameStore((state) => state.lumens.lumens)
  const displayLumens = myCharacter?.experience ?? storeLumens
  const breachStage = gameData?.progression_snapshot?.breach_stage
  const displayBreachStage = typeof breachStage === 'number' ? breachStage : displayLumens

  return (
    <View style={journalAttributeStyles.attributeChangesContainer}>
      <Text variant="label" size={2} align="center">+1 Lumens</Text>
      <Text variant="label" size={2} align="center">Total {displayBreachStage} helping you clear the rot</Text>
      
    </View>
  )
}



