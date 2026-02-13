
import { View, Pressable } from 'react-native'
import { hubPaginationStyles } from '@/styles/hub/hub-styles'
import type { HubPaginationProps } from '@/types/hub/hub'


export function HubPagination({ cards, activeIndex, onDotPress }: HubPaginationProps) {


  function handleDotPress(index: number) {

    onDotPress(index)
  }

  return (
    <View style={hubPaginationStyles.container}>
      {cards.map((card, index) => {
        const isActive = index === activeIndex
        return (
          <Pressable
            key={index}
            onPress={() => handleDotPress(index)}
            style={[
              hubPaginationStyles.dot,
              isActive && hubPaginationStyles.dotActive,
            ]}
          />
        )
      })}
    </View>
  )
}


