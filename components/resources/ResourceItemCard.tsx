import React from 'react'
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ResourceItem } from '@/types/hooks'

interface ResourceItemCardProps {
  item: ResourceItem
  onPress?: () => void
}

export function ResourceItemCard({ item, onPress }: ResourceItemCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.resourceCardTouchable}
      disabled={item.isLocked}
      onPress={onPress}
    >
      <View 
        style={[
          styles.resourceCard,
          item.isLocked && styles.resourceCardLocked
        ]}
      >
        <View style={styles.resourceCardContentWrapper}>
          <ImageBackground
            source={item.backgroundImage || require('../../assets/UI/cards/libraryResource.jpg')}
            style={styles.resourceCardBackground}
            resizeMode="contain"
            imageStyle={styles.resourceCardImage}
          >
            <View style={styles.resourceCardOverlay} />
            <View style={styles.resourceCardContent}>
              <View style={styles.resourceCardTop}>
                <Text style={styles.resourceTitle}>{item.title}</Text>
                <Text style={styles.resourceType}>{item.type}</Text>
              </View>
              {item.isLocked && (
                <View style={styles.lockIconContainer}>
                  <MaterialCommunityIcons name="lock-outline" size={48} color="#ffffff" />
                </View>
              )}
              {item.description && (
                <View style={styles.resourceCardBottom}>
                  <Text style={styles.resourceDescription}>{item.description}</Text>
                </View>
              )}
            </View>
          </ImageBackground>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  resourceCardTouchable: {
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
  },
  resourceCard: {
    flex: 1,
    minHeight: 200,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 0,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resourceCardContentWrapper: {
    overflow: 'hidden',
    borderRadius: 16,
    flex: 1,
    minHeight: 200,
  },
  resourceCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.6,
  },
  resourceCardBackground: {
    width: '100%',
    height: '100%',
    minHeight: 200,
    backgroundColor: '#1a1a2e',
  },
  resourceCardImage: {
    opacity: 1,
  },
  resourceCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  resourceCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  resourceCardTop: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  resourceCardBottom: {
    justifyContent: 'flex-end',
  },
  resourceTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 34,
  },
  resourceType: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resourceDescription: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lockIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
})

