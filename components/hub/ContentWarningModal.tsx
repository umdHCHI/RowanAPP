import type React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

interface ContentWarningModalProps {
  visible: boolean
  onClose: () => void
  title: string
  content?: string
  revelations?: string[]
}

export function ContentWarningModal({ visible, onClose, title, content, revelations }: ContentWarningModalProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const insets = useSafeAreaInsets()

  // Build content warning text with revelations if provided
  function buildWarningContent(): string {
    // If custom content is provided, use it
    if (content) {
      return content
    }

    // Base warning text
    const baseText = 'This story may contain themes that some players may find sensitive or triggering.'

    // Debug: Log revelations to see what we're receiving
    console.log('ContentWarningModal - revelations:', revelations)
    console.log('ContentWarningModal - revelations type:', typeof revelations)
    console.log('ContentWarningModal - revelations is array:', Array.isArray(revelations))
    console.log('ContentWarningModal - revelations length:', revelations?.length)

    // If revelations exist, format them into the text
    if (revelations && Array.isArray(revelations) && revelations.length > 0) {
      // Filter out any empty strings or null values
      const validRevelations = revelations.filter((r) => r && typeof r === 'string' && r.trim().length > 0)
      
      if (validRevelations.length > 0) {
        // Format revelations: "theme1, theme2, and theme3"
        let themesText = ''
        if (validRevelations.length === 1) {
          themesText = validRevelations[0]
        } else if (validRevelations.length === 2) {
          themesText = `${validRevelations[0]} and ${validRevelations[1]}`
        } else {
          const lastTheme = validRevelations[validRevelations.length - 1]
          const otherThemes = validRevelations.slice(0, -1).join(', ')
          themesText = `${otherThemes}, and ${lastTheme}`
        }
        
        return `${baseText} Specific themes include: ${themesText}. Please proceed with caution and take care of yourself while playing.`
      }
    }

    // Default text if no revelations
    return `${baseText} Please proceed with caution and take care of yourself while playing.`
  }

  const warningContent = buildWarningContent()

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
            
            <Text style={styles.modalTitle}>Content Warning</Text>

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
            <View style={styles.warningContentContainer}>
              <Text style={styles.warningContentText}>
                {warningContent}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonLarge}
              onPress={handleClose}
              activeOpacity={0.7}
            >
 
          
              <Text style={styles.closeButtonText}>I Understand</Text>
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
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 32,
  },
  modalTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    //flex: 1,
  },
  closeButton: {
    padding: 2,
    width: 32,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  contentScrollView: {
    flex: 1,
    maxHeight: 400,
    marginBottom: 16,
    minHeight: 100,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  warningContentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  warningContentText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    width: '100%',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
  },
})

