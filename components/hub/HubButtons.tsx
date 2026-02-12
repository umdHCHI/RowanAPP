import { View } from 'react-native'
import type { StoryCard } from '@/types/hub/hub'
import { Button, Text } from '@/components/ui'
import { hubButtonsStyles } from '@/styles/hub/hub-styles'
import type { HubButtonsProps } from '@/types/hub/hub'


function getButtonText(card: StoryCard): string {
  if (card.status === 'completed') return 'Restart this Book'
  if (card.inProgress) return 'Continue this Book'
  return 'Explore this Book'
}

export function HubButtons({ card, onPrimaryPress }: HubButtonsProps) {
  return (
    <View style={hubButtonsStyles.container}>
      <Button
        variant="primary"
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



