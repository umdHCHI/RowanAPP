import type React from 'react'
import { View, Modal, ScrollView, TouchableOpacity } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import type { PowerDetailsModalProps } from '@/types/resources/resources'
import { powerDetailsModalStyles as styles } from '@/styles/resources/resources-styles'

export function PowerDetailsModal({
  visible,
  onClose,
  title,
  description,
  subtitle,
  icon,
  isActive,
}: PowerDetailsModalProps) {
  const insets = useSafeAreaInsets()
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()

  function handleClose() {
    haptics.lightImpact()
    playPageFlipSound()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text variant="heading" size={1} style={{ color: '#ffffff', textAlign: 'center' }}>
              Power Details
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <MaterialDesignIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={styles.contentWrapper}>
              <Text variant="title" size={1} style={styles.powerTitle}>{title}</Text>

              {isActive && (
                <View style={styles.activeBadge}>
                  <Text variant="label" style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}

              {(icon || subtitle) && (
                <View style={styles.iconSubtitleRow}>
                  {icon && (
                    <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                      {typeof icon === 'string' ? (
                        <MaterialDesignIcons name={icon as any} size={48} color="#D4AF37" />
                      ) : (
                        icon
                      )}
                    </View>
                  )}

                  {subtitle && (
                    <View style={styles.subtitleContainer}>
                      <Text variant="body" size={2} style={styles.subtitleText}>
                        {subtitle}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button variant="secondary" fullWidth onPress={handleClose}>
              Close
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
