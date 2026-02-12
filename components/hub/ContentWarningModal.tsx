import React from 'react'
import { Modal, ScrollView, Pressable as RNPressable, View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ContentWarningModalProps } from '@/types/hub/hub'
import { Text, Button } from '@/components/ui'
import { contentWarningModalStyles } from '@/styles/hub/hub-styles'

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
      <View style={[contentWarningModalStyles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <RNPressable style={contentWarningModalStyles.backdropPressable} onPress={onClose}>
          <View style={contentWarningModalStyles.backdrop} />
        </RNPressable>
        <View style={contentWarningModalStyles.modalInner}>
          <View style={contentWarningModalStyles.panel}>
            <View style={contentWarningModalStyles.contentContainer}>
              <View style={contentWarningModalStyles.headerRow}>
                <View style={contentWarningModalStyles.iconCircle}>
                  <MaterialCommunityIcons name="alert" size={24} color="#fbbf24" />
                </View>
                <View style={contentWarningModalStyles.textContainer}>
                  <Text variant="title" size={2} color="#f8fafc">
                    Content Warning
                  </Text>
                  <ScrollView
                    style={contentWarningModalStyles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={contentWarningModalStyles.scrollContent}
                  >
                    <Text variant="body" size={2} color="#e2e8f0" align="left">
                      {warningContent}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            </View>
            <View style={contentWarningModalStyles.buttonContainer}>
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

