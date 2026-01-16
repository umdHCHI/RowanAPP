import type React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

interface PowerDetailsModalProps {
  visible: boolean
  onClose: () => void
  title: string
  description?: string
  subtitle?: string
  icon?: string | React.ReactNode
  isActive?: boolean
}

export function PowerDetailsModal({ 
  visible, 
  onClose, 
  title, 
  description, 
  subtitle,
  icon,
  isActive 
}: PowerDetailsModalProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const insets = useSafeAreaInsets()

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            
            <Text style={styles.modalTitle}>Power Details</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content - Scrollable */}
          <ScrollView 
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={styles.contentWrapper}>
              {/* Title */}
              <Text style={styles.powerTitle}>{title}</Text>

              {/* Active Badge */}
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}

              {/* Icon and Subtitle Row */}
              {(icon || subtitle) && (
                <View style={styles.iconSubtitleRow}>
                  {/* Icon */}
                  {icon && (
                    <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                      {typeof icon === 'string' ? (
                        <MaterialCommunityIcons name={icon as any} size={48} color="#D4AF37" />
                      ) : (
                        icon
                      )}
                    </View>
                  )}

                  {/* Subtitle (long description) */}
                  {subtitle && (
                    <View style={styles.subtitleContainer}>
                      <Text style={styles.subtitleText}>
                        {subtitle}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonLarge}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerSpacer: {
    width: 32,
  },
  modalTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
  },
  closeButton: {
    padding: 2,
    width: 32,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  contentScrollView: {
    maxHeight: 500,
    marginBottom: 12,
  },
  contentContainer: {
    flexGrow: 0,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  iconSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: 16,
    marginTop: 12,
    paddingHorizontal: 4,
    minWidth: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    flexShrink: 0,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  powerTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 36,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 42,
  },
  activeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 16,
  },
  activeBadgeText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#D4AF37',
    textTransform: 'uppercase',
  },
  subtitleContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  subtitleText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonLarge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
})

