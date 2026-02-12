
import { ImageBackground, Pressable as RNPressable, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { Text } from '@/components/ui'
import { resourceCardStyles } from '@/styles/hub/hub-styles'
import type { ResourceCardProps } from '@/types/hub/hub'

export function ResourceCard({ card, onResourcePress }: ResourceCardProps) {
  return (
    <View style={resourceCardStyles.wrapper}>
      <RNPressable onPress={onResourcePress} style={resourceCardStyles.pressable}>
        <View style={resourceCardStyles.container}>
          <ImageBackground
            source={require('../../assets/UI/cards/libraryResource.jpg')}
            style={resourceCardStyles.imageBackground}
            resizeMode="cover"
            imageStyle={resourceCardStyles.imageStyle}
          >
            <View style={resourceCardStyles.overlay} />
            <View style={resourceCardStyles.content}>
              <View style={resourceCardStyles.header}>
                <View style={resourceCardStyles.labelContainer}>
                  <Text variant="serif" numberOfLines={1}>
                    {card.label}
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={24} 
                  color="#ffffffcc"
                />
              </View>
              <Text variant="title" size={1} >
                {`${card.label} Resources`}
              </Text>
              <Text variant="body" size={2} >
                Overview information on resources aquired from this story.
              </Text>
            </View>
          </ImageBackground>
        </View>
      </RNPressable>
    </View>
  )
}
