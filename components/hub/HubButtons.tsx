import { View } from 'react-native'
import type { StoryCard, HubButtonsProps } from '@/types/hub/hub'
import { Button, Text } from '@/components/ui'
import { hubButtonsStyles } from '@/styles/hub/hub-styles'


function getButtonText(card: StoryCard): string {
  if (card.status === 'completed') return 'Continue this Book'
  if (card.inProgress) return 'Continue this Book'
  return 'Explore this Book'
}

export function HubButtons({ card, onPrimaryPress }: HubButtonsProps) {
  return (
    <View style={hubButtonsStyles.container}>
      <Button
        variant="tertiary"
        onPress={onPrimaryPress}
        fullWidth
        enableSound={true}
        enableHaptics={true}

      >
        <Text variant="title" size={1}>{getButtonText(card)}</Text>
      </Button>
    </View>
  )
}



