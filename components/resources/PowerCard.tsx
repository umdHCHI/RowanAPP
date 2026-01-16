import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

interface PowerCardProps {
  id: string
  title: string
  description?: string
  subtitle?: string
  isUnlocked: boolean
  isNew?: boolean
  isActive?: boolean
  icon?: string | React.ReactNode
  onPress?: () => void
  powerLevel?: number | null
}

export function PowerCard({
  id,
  title,
  description,
  subtitle,
  isUnlocked,
  isNew = false,
  isActive = false,
  icon,
  onPress,
  powerLevel,
}: PowerCardProps) {
  const playPageFlipSound = usePageFlipSound()

  function handlePress() {
    if (!isUnlocked || !onPress) return
    playPageFlipSound()
    onPress()
  }

  // Determine label text
  const labelText = isNew ? 'NEW POWER UNLOCKED' : isUnlocked ? 'POWER' : 'LOCKED'
  
  // Determine action text
  const actionText = isUnlocked ? 'View' : undefined

  const cardContent = (
    <View
      style={[
        styles.card,
        isNew && styles.cardNew,
        !isUnlocked && styles.cardLocked,
      ]}
    >
      {/* New unlock glow effect */}
      {isNew && <View style={styles.newGlow} />}
      
      {/* Top label row */}
      <View style={styles.labelRow}>
        {isNew && (
          <>
            <View style={styles.dividerLine} />
            <Text style={[styles.label, styles.labelNew]}>{labelText}</Text>
            <View style={styles.dividerLine} />
          </>
        )}
        {!isNew && <Text style={styles.label}>{labelText}</Text>}
      </View>

      {/* Card content */}
      <View style={styles.cardBody}>
        {/* Icon area (left side) */}
        {icon && (
          <View style={[styles.iconContainer, isNew && styles.iconContainerNew]}>
            {typeof icon === 'string' ? (
              <MaterialCommunityIcons name={icon as any} size={32} color="#D4AF37" />
            ) : (
              icon
            )}
          </View>
        )}

        {/* Text content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, !isUnlocked && styles.titleLocked]}>
            {title}
          </Text>
          {description && (
            <Text
              style={[styles.description, !isUnlocked && styles.descriptionLocked]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      {/* Power Level */}
      {isUnlocked && powerLevel !== null && powerLevel !== undefined && (
        <View style={styles.powerLevelContainer}>
          <View style={styles.powerLevelBadge}>
            <Text style={styles.powerLevelLabel}>Level</Text>
            <Text style={styles.powerLevelValue}>{powerLevel}</Text>
          </View>
        </View>
      )}

      {/* Footer row */}
      <View style={styles.footerRow}>
        {isActive && (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        )}
        {actionText && (
          <Text style={styles.actionText}>{actionText}</Text>
        )}
      </View>
    </View>
  )

  if (onPress && isUnlocked) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          pressed && styles.cardPressed,
        ]}
      >
        {cardContent}
      </Pressable>
    )
  }

  return cardContent
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardNew: {
    borderColor: 'rgba(212, 175, 55, 0.6)',
    borderWidth: 1.5,
  },
  cardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  cardPressed: {
    opacity: 0.8,
  },
  newGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  },
  labelNew: {
    color: '#D4AF37',
    letterSpacing: 2.5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  iconContainerNew: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 28,
  },
  titleLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  description: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  descriptionLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  statusText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  actionText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  powerLevelContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  powerLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  powerLevelLabel: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  powerLevelValue: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
})

