import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import type { PowerCardProps } from '@/types/resources/resources'
import { powerCardStyles as styles } from '@/styles/resources/resources-styles'

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

  const labelText = isNew ? 'NEW POWER UNLOCKED' : isUnlocked ? 'POWER' : 'LOCKED'
  const actionText = isUnlocked ? 'View' : undefined

  const cardContent = (
    <View style={[styles.cardWrapper, !isUnlocked && styles.cardLocked, isNew && styles.cardNew]}>
      {isNew && <View style={styles.newGlow} />}
      <Card variant="resource" padding={20} fullWidth>
        <View style={styles.labelRow}>
          {isNew && (
            <>
              <View style={styles.dividerLine} />
              <Text variant="label" style={StyleSheet.flatten(isNew ? [styles.label, styles.labelNew] : styles.label)}>{labelText}</Text>
              <View style={styles.dividerLine} />
            </>
          )}
          {!isNew && <Text variant="label" style={styles.label}>{labelText}</Text>}
        </View>

        <View style={styles.cardBody}>
          {icon && (
            <View style={[styles.iconContainer, isNew && styles.iconContainerNew]}>
              {typeof icon === 'string' ? (
                <MaterialDesignIcons name={icon as any} size={32} color="#D4AF37" />
              ) : (
                icon
              )}
            </View>
          )}

          <View style={styles.textContent}>
            <Text variant="title" size={2} style={StyleSheet.flatten(!isUnlocked ? [styles.title, styles.titleLocked] : styles.title)}>
              {title}
            </Text>
            {description && (
              <Text
                variant="body"
                size={1}
                style={StyleSheet.flatten(!isUnlocked ? [styles.description, styles.descriptionLocked] : styles.description)}
                numberOfLines={2}
              >
                {description}
              </Text>
            )}
          </View>
        </View>

        {isUnlocked && powerLevel !== null && powerLevel !== undefined && (
          <View style={styles.powerLevelContainer}>
            <View style={styles.powerLevelBadge}>
              <Text variant="label" style={styles.powerLevelLabel}>Level</Text>
              <Text variant="body" size={2} style={styles.powerLevelValue}>{powerLevel}</Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          {isActive && (
            <View style={styles.statusPill}>
              <Text variant="label" style={styles.statusText}>Active</Text>
            </View>
          )}
          {actionText && (
            <Text variant="body" size={1} style={styles.actionText}>{actionText}</Text>
          )}
        </View>
      </Card>
    </View>
  )

  if (onPress && isUnlocked) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [pressed && styles.cardPressed]}
      >
        {cardContent}
      </Pressable>
    )
  }

  return cardContent
}
