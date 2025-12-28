import React, { useMemo } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { CharacterAvatar } from '@/components/CharacterAvatar'
interface ResourcesPowersTabProps {
  attributes: Array<{
    label: string
    value: number
  }>
  equippedGear: Array<any>
  characterName: string
  avatarConfig: string | null
}

/**
 * Map wellness value to level (1-5) for image selection
 */
function mapValueToLevel(value: number): number {
  if (value <= 0) return 1
  const level = Math.round(value / 5)
  if (level < 1) return 1
  if (level > 5) return 5
  return level
}

/**
 * Attribute images mapping
 */
const attributeImages = {
  Exploration: {
    1: require('../../assets/attributes/exploration/explorationLv1.png'),
    2: require('../../assets/attributes/exploration/explorationLv2.png'),
    3: require('../../assets/attributes/exploration/explorationLv3.png'),
    4: require('../../assets/attributes/exploration/explorationLv4.png'),
    5: require('../../assets/attributes/exploration/explorationLv5.png'),
  },
  Courage: {
    1: require('../../assets/attributes/courage/courageLv1.png'),
    2: require('../../assets/attributes/courage/courageLv2.png'),
    3: require('../../assets/attributes/courage/courageLv3.png'),
    4: require('../../assets/attributes/courage/courageLv4.png'),
    5: require('../../assets/attributes/courage/courageLv5.png'),
  },
  Connection: {
    1: require('../../assets/attributes/connection/connectionLv1.png'),
    2: require('../../assets/attributes/connection/connectionLv2.png'),
    3: require('../../assets/attributes/connection/connectionLv3.png'),
    4: require('../../assets/attributes/connection/connectionLv4.png'),
    5: require('../../assets/attributes/connection/connectionLv5.png'),
  },
  Fear: {
    1: require('../../assets/attributes/fear/fear1.png'),
    2: require('../../assets/attributes/fear/fearLv2.png'),
    3: require('../../assets/attributes/fear/fearLv3.png'),
    4: require('../../assets/attributes/fear/fearLv4.png'),
    5: require('../../assets/attributes/fear/fearLv5.png'),
  },
}

export function ResourcesPowersTab({
  attributes,
  equippedGear,
  characterName,
  avatarConfig,
}: ResourcesPowersTabProps) {
  const displayAttributes = useMemo(() => {
    return attributes
      .filter((stat) => attributeImages[stat.label as keyof typeof attributeImages])
      .map((stat) => {
        const level = mapValueToLevel(stat.value)
        const images = attributeImages[stat.label as keyof typeof attributeImages]
        return {
          ...stat,
          level,
          image: images[level as keyof typeof images],
        }
      })
  }, [attributes])

  return (
    <View style={styles.powersContainer}>
      <View style={styles.identityContainer}>
        <View style={styles.identityIcon}>
          {avatarConfig ? (
            <CharacterAvatar avatarConfig={avatarConfig} size={120} />
          ) : (
            <MaterialCommunityIcons name="compass-outline" size={64} color="#ffffff" />
          )}
        </View>
        <Text style={styles.identityName}>{characterName}</Text>
      </View>
      
      {/* Attributes Section */}
      {displayAttributes.length > 0 && (
        <View style={styles.powersListContainer}>
          <Text style={styles.powersHeading}>YOUR POWERS</Text>
          <View style={styles.powersGrid}>
            {displayAttributes.map((attr) => (
              <View key={`attr-${attr.label}`} style={styles.powerItem}>
                <View style={styles.powerIconContainer}>
                  <Image
                    source={attr.image}
                    style={styles.powerImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.powerName}>{attr.label}</Text>
                <Text style={styles.powerValue}>{attr.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Gear Section */}
      {equippedGear.length > 0 && (
        <View style={styles.gearListContainer}>
          <Text style={styles.gearHeading}>YOUR GEAR</Text>
          <View style={styles.gearGrid}>
            {equippedGear.map((gearItem: any) => {
              const gearType = gearItem.gear_type || {}
              const isEquipped = gearItem.is_equipped || false
              
              return (
                <View key={`gear-${gearItem.id}`} style={styles.gearItem}>
                  <View style={[
                    styles.gearIconContainer,
                    isEquipped && styles.gearIconContainerEquipped
                  ]}>
                    <Text style={styles.gearEmoji}>{gearType.emoji_icon || '🎁'}</Text>
                    {isEquipped && (
                      <View style={styles.equippedBadge}>
                        <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.gearName} numberOfLines={2}>
                    {gearType.name || 'Unknown Gear'}
                  </Text>
                  {gearType.slot && (
                    <Text style={styles.gearType}>{gearType.slot.toUpperCase()}</Text>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  powersContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  identityContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  identityIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  identityName: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
  },
  powersListContainer: {
    width: '100%',
    alignSelf: 'flex-start',
  },
  powersHeading: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    marginBottom: 20,
  },
  powersGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  powerItem: {
    alignItems: 'center',
    flex: 1,
  },
  powerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  powerName: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
  powerValue: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  powerImage: {
    width: 60,
    height: 60,
  },
  gearListContainer: {
    width: '100%',
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  gearHeading: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    marginBottom: 20,
  },
  gearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gearItem: {
    alignItems: 'center',
    width: '30%',
    minWidth: 100,
  },
  gearIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  gearIconContainerEquipped: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  gearEmoji: {
    fontSize: 36,
  },
  equippedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  gearName: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
  },
  gearType: {
    fontFamily: 'System',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

