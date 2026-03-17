
import { Modal, ScrollView, Pressable as RNPressable, View } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ContentWarningModalProps } from '@/types/hub/hub'
import { Text, Button } from '@/components/ui'
import { contentWarningModalStyles } from '@/styles/hub/hub-styles'

function buildWarningContent({
  content,
  storyThemes,
}: {
  content?: string
  storyThemes?: string[]
}): { baseText: string; themesText?: string; tailText: string; rawContent?: string } {
  if (content) {
    return {
      baseText: '',
      tailText: '',
      rawContent: content,
    }
  }

  const baseText =
    'This story may contain themes that some players may find sensitive or triggering.'
  const tailText = 'Please proceed with caution and take care of yourself while playing.'

  if (storyThemes?.length) {
    const valid = storyThemes.filter(
      (r) => typeof r === 'string' && r.trim().length > 0
    )
    if (valid.length > 0) {
      const themesText =
        valid.length === 1
          ? valid[0]
          : valid.length === 2
            ? `${valid[0]} and ${valid[1]}`
            : `${valid.slice(0, -1).join(', ')}, and ${valid[valid.length - 1]}`
      return { baseText, themesText, tailText }
    }
  }

  return { baseText, tailText }
}

export function ContentWarningModal({
  visible,
  onClose,
  title,
  content,
  storyThemes,
}: ContentWarningModalProps) {
  const warningContent = buildWarningContent({ content, storyThemes })
  const hasRawContent = typeof warningContent.rawContent === 'string'
    && warningContent.rawContent.length > 0
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[contentWarningModalStyles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <RNPressable
          style={contentWarningModalStyles.backdropPressable}
          onPress={onClose}
          accessible={false}
        >
          <View style={contentWarningModalStyles.backdrop} />
        </RNPressable>
        <View style={contentWarningModalStyles.modalInner}>
          <View style={contentWarningModalStyles.panel}>
            <View style={contentWarningModalStyles.contentContainer}>
              <View style={contentWarningModalStyles.headerRow}>
                <View style={contentWarningModalStyles.iconCircle}>
                  <MaterialDesignIcons
                    name="alert-decagram"
                    size={28}
                    color="#f59e0b"
                  />
                </View>
                <View style={contentWarningModalStyles.textContainer}>
                  <Text variant="title" size={1} color="#f8fafc">
                    Content Warning
                  </Text>
                  <ScrollView
                    style={contentWarningModalStyles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={contentWarningModalStyles.scrollContent}
                  >
                    <Text variant="body" size={2} color="#e2e8f0" align="left">
                      {hasRawContent ? (
                        warningContent.rawContent
                      ) : (
                        <>
                          {warningContent.baseText}
                          {warningContent.themesText ? (
                            <>
                              {'\n'}
                              {'Specific themes include:'}
                              {'\n'}
                              <Text variant="body" size={2} color="#e2e8f0" style={{ fontWeight: '700' }}>
                                {warningContent.themesText}
                              </Text>
                              {'.'}
                              {'\n'}
                              {warningContent.tailText}
                            </>
                          ) : (
                            <>
                              {'\n'}
                              {warningContent.tailText}
                            </>
                          )}
                        </>
                      )}
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
                <Text variant="label" size={2} align="center">
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

