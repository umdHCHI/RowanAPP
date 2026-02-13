import React from 'react'
import { View, TouchableOpacity, ImageBackground } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { Text } from '@/components/ui/Text'
import type { ResourceItemCardProps } from '@/types/resources/resources'
import { resourceItemCardStyles as styles } from '@/styles/resources/resources-styles'

export function ResourceItemCard({ card, onResourcePress }: ResourceItemCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.resourceCardTouchable}
      disabled={card.status === 'locked'}
      onPress={onResourcePress}
    >
      <View
        style={[
          styles.resourceCard,
          card.status === 'locked' && styles.resourceCardLocked,
        ]}
      >
        <View style={styles.resourceCardContentWrapper}>
          <ImageBackground
            source={card.imageUrl ? { uri: card.imageUrl } : require('../../assets/UI/cards/libraryResource.jpg')}
            style={styles.resourceCardBackground}
            resizeMode="contain"
            imageStyle={styles.resourceCardImage}
          >
            <View style={styles.resourceCardOverlay} />
            <View style={styles.resourceCardContent}>
              <View style={styles.resourceCardTop}>
                <Text variant="title" size={2} style={styles.resourceTitle}>{card.title}</Text>
                <Text variant="label" style={styles.resourceType}>{card.type}</Text>
              </View>
              {card.status === 'locked' && (
                <View style={styles.lockIconContainer}>
                  <MaterialDesignIcons name="lock-outline" size={48} color="#ffffff" />
                </View>
              )}
              {card.description && (
                <View style={styles.resourceCardBottom}>
                  <Text variant="body" size={1} style={styles.resourceDescription}>{card.description}</Text>
                </View>
              )}
            </View>
          </ImageBackground>
        </View>
      </View>
    </TouchableOpacity>
  )
}
