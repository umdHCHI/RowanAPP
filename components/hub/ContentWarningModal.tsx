import React from 'react'
import { Modal, ScrollView, Pressable as RNPressable, View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ContentWarningModalProps } from '@/types/hub'
import { Text, Button } from '@/components/ui'

function buildWarningContent({
  content,
  revelations,
}: {
  content?: string
  revelations?: string[]
}): string {
  if (content) return content

  const baseText =
    'This story may contain themes that some players may find sensitive or triggering.'

  if (revelations?.length) {
    const valid = revelations.filter(
      (r) => typeof r === 'string' && r.trim().length > 0
    )
    if (valid.length > 0) {
      const themesText =
        valid.length === 1
          ? valid[0]
          : valid.length === 2
            ? `${valid[0]} and ${valid[1]}`
            : `${valid.slice(0, -1).join(', ')}, and ${valid[valid.length - 1]}`
      return `${baseText} Specific themes include: ${themesText}. Please proceed with caution and take care of yourself while playing.`
    }
  }

  return `${baseText} Please proceed with caution and take care of yourself while playing.`
}

export function ContentWarningModal({
  visible,
  onClose,
  title,
  content,
  revelations,
}: ContentWarningModalProps) {
  const warningContent = buildWarningContent({ content, revelations })
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <RNPressable style={styles.backdropPressable} onPress={onClose}>
          <View style={styles.backdrop} />
        </RNPressable>
        <View style={styles.modalInner}>
          <View style={styles.panel}>
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="alert" size={24} color="#fbbf24" />
                </View>
                <View style={styles.textContainer}>
                  <Text variant="title" size={1}>
                    Content Warning
                  </Text>
                  <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text variant="body" size={2} color="rgba(255, 255, 255, 0.9)" align="left">
                      {warningContent}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                variant="secondary"
                onPress={onClose}
                fullWidth
              >
                <Text variant="title" size={2} align="center">
                  I Understand
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  scrollView: {
    maxHeight: 200,
    marginVertical: 8,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
})
