import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Image } from 'react-native'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { PowerCard } from './PowerCard'
import { PowerDetailsModal } from './PowerDetailsModal'
import { useGameStore, type Power } from '@/stores/game-store'
import { attributeImages } from '@/utils/attribute-images'

/**
 * Power descriptions mapping
 */
const powerDescriptions: Record<string, string> = {
  Exploration: 'Your capacity to venture into the unknown and discover new paths.',
  Courage: 'The strength to face challenges and move forward despite fear.',
  Connection: 'Your ability to form meaningful bonds with others and yourself.',
  Fear: 'An awareness of what holds you back, and the first step toward understanding it.',
}

/**
 * Map attribute value (0-20) to image level (1-5)
 * Max is 20, with 5 images per attribute
 * 0-4 = level 1, 5-8 = level 2, 9-12 = level 3, 13-16 = level 4, 17-20 = level 5
 */
function mapValueToImageLevel(value: number): number {
  if (value <= 0) return 1
  if (value <= 4) return 1
  if (value <= 8) return 2
  if (value <= 12) return 3
  if (value <= 16) return 4
  return 5
}

interface ResourcesPowersTabProps {
  attributes: Array<{
    label: string
    value: number
  }>
  equippedGear: Array<any>
  characterName: string
  avatarConfig: string | null
  powers: Array<Power & { isNew?: boolean }>
  markPowersSeen: () => void
  experience: number
}

export function ResourcesPowersTab({
  attributes,
  equippedGear,
  characterName,
  avatarConfig,
  powers,
  markPowersSeen,
  experience,
}: ResourcesPowersTabProps) {
  const setActivePower = useGameStore((state) => state.setActivePower)
  const [selectedPower, setSelectedPower] = useState<Power & { isNew?: boolean; icon?: string | React.ReactNode } | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Mark powers as seen after mount (with delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      markPowersSeen()
    }, 500)
    return () => clearTimeout(timer)
  }, [markPowersSeen])

  // Find strongest power (attribute with highest value)
  const strongestPower = useMemo(() => {
    if (!attributes || attributes.length === 0) return null
    
    const sorted = [...attributes].sort((a, b) => b.value - a.value)
    const strongest = sorted[0]
    
    if (strongest.value <= 0) return null
    
    const imageLevel = mapValueToImageLevel(strongest.value)
    const attrKey = strongest.label.toLowerCase() as keyof typeof attributeImages
    
    if (!attributeImages[attrKey]) return null
    
    const imageSource = attributeImages[attrKey][imageLevel as keyof typeof attributeImages[typeof attrKey]]
    if (!imageSource) return null
    
    return {
      label: strongest.label,
      image: imageSource,
    }
  }, [attributes])

  // Convert attributes to powers with images
  const powersFromAttributes = useMemo((): Array<Power & { isNew?: boolean; icon?: string | React.ReactNode }> => {
    return attributes.map((attr) => {
      const isUnlocked = attr.value > 0
      const imageLevel = mapValueToImageLevel(attr.value)
      const attrKey = attr.label.toLowerCase() as keyof typeof attributeImages

      // Get the image if attribute exists in mapping
      let icon: string | React.ReactNode = 'sparkles' // fallback icon
      if (attributeImages[attrKey] && isUnlocked) {
        const imageSource = attributeImages[attrKey][imageLevel as keyof typeof attributeImages[typeof attrKey]]
        if (imageSource) {
          icon = (
            <Image
              source={imageSource}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          )
        }
      }

      // Find matching power from store to get isNew and isActive
      const storePower = powers.find((p) => p.id === `power-${attr.label}` || p.title === attr.label)

      return {
        id: `power-${attr.label}`,
        title: attr.label,
        description: powerDescriptions[attr.label] || `Your ${attr.label.toLowerCase()} ability.`,
        isUnlocked,
        isNew: storePower?.isNew || false,
        isActive: storePower?.isActive || false,
        icon,
      } as Power & { isNew?: boolean; icon?: string | React.ReactNode }
    })
  }, [attributes, powers])

  function handlePowerPress(power: Power & { isNew?: boolean; icon?: string | React.ReactNode }) {
    if (!power.isUnlocked) return

    // Set as active power
    setActivePower(power.id)

    // Open power details modal
    setSelectedPower(power)
    setModalVisible(true)
  }

  function handleCloseModal() {
    setModalVisible(false)
    setSelectedPower(null)
  }

  function renderPowerCard({ item }: { item: Power & { isNew?: boolean; icon?: string | React.ReactNode } }) {
    return (
      <PowerCard
        id={item.id}
        title={item.title}
        description={item.description}
        isUnlocked={item.isUnlocked}
        isNew={item.isNew || false}
        isActive={item.isActive || false}
        icon={item.icon || 'sparkles'}
        onPress={() => handlePowerPress(item)}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarConfig ? (
            <CharacterAvatar avatarConfig={avatarConfig} size={100} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{characterName}</Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{experience}</Text>
              <Text style={styles.statLabel}>Lumens Gathered = Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {strongestPower ? (
                <>
                  <Image
                    source={strongestPower.image}
                    style={styles.strongestPowerImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.statLabel}>Strongest Power</Text>
                </>
              ) : (
                <>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Strongest Power</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Powers</Text>
        <Text style={styles.subtitle}>Abilities you uncover in The Archive.</Text>
      </View>

      {/* Powers List */}
      {powersFromAttributes.length > 0 ? (
        <FlatList
          data={powersFromAttributes}
          renderItem={renderPowerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No powers unlocked yet.</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No powers available.</Text>
        </View>
      )}

      {/* Power Details Modal */}
      {selectedPower && (
        <PowerDetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedPower.title}
          description={selectedPower.description}
          icon={selectedPower.icon}
          isActive={selectedPower.isActive}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'BeyondWonderland',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 32,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  strongestPowerImage: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
})

