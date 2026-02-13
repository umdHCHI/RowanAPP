import React, { useState } from 'react'
import {
  View,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Pressable as RNPressable,
} from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getBugReportUrl } from '@/api/constants'
import { colors } from '@/theme/design-tokens'
import { Text, Button } from '@/components/ui'
import { bugReportModalStyles } from '@/styles/hub/hub-styles'
import type { MenuOverlayProps } from '@/types/hub/hub'

export function BugReportModal({ visible, onClose }: MenuOverlayProps) {
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const insets = useSafeAreaInsets()

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the bug you encountered.')
      return
    }
    setIsSubmitting(true)

    try {
      const url = getBugReportUrl()
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          email: email.trim() || 'anonymous',
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        }),
      })

      if (response.ok) {
        Alert.alert(
          'Thank you!',
          'Your bug report has been submitted. We appreciate your help!',
          [
            {
              text: 'OK',
              onPress: () => {
                setDescription('')
                setEmail('')
                onClose()
              },
            },
          ]
        )
      } else {
        let message = `Request failed (${response.status})`
        try {
          const data = await response.json()
          if (data?.error && typeof data.error === 'string') {
            message = data.error
          }
        } catch {
          // ignore parse error
        }
        console.warn('Bug report failed:', response.status, url, message)
        throw new Error(message)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network or server error'
      console.warn('Bug report error:', message, error)
      Alert.alert(
        'Error',
        message.includes('Request failed') || message.includes('Failed')
          ? message
          : 'Failed to submit bug report. Please try again later.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDescription('')
    setEmail('')
    onClose()
  }


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[
          bugReportModalStyles.modalContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <RNPressable
          style={bugReportModalStyles.backdropPressable}
          onPress={handleClose}
          accessible={false}
        >
          <View style={bugReportModalStyles.backdrop} />
        </RNPressable>
        <View style={bugReportModalStyles.modalInner}>
          <View style={bugReportModalStyles.panel}>
            <View style={bugReportModalStyles.contentContainer}>
              <View style={bugReportModalStyles.headerRow}>
                <View style={bugReportModalStyles.headerTitle}>
                  <Text variant="title" size={1} color="#f8fafc">
                    Report a Bug
                  </Text>
                </View>
                <RNPressable
                  style={bugReportModalStyles.closeButton}
                  onPress={handleClose}
                  disabled={isSubmitting}
                  accessibilityLabel="Close"
                >
                  <MaterialDesignIcons
                    name="close"
                    size={24}
                    color="#f8fafc"
                  />
                </RNPressable>
              </View>

              <Text
                variant="body"
                size={2}
                color="#e2e8f0"
                style={bugReportModalStyles.descriptionText}
              >
                Help us improve by reporting any issues you've encountered.
              </Text>

              <TextInput
                style={bugReportModalStyles.input}
                placeholder="Your email (optional)"
                placeholderTextColor={colors.archive.white}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />

              <TextInput
                style={[
                  bugReportModalStyles.input,
                  bugReportModalStyles.inputMultiline,
                ]}
                placeholder="Describe the bug"
                placeholderTextColor={colors.archive.white}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                editable={!isSubmitting}
              />
            </View>

            <View style={bugReportModalStyles.buttonContainer}>
              <View style={bugReportModalStyles.buttonWrapper}>
                <Button
                  variant="secondary"
                  onPress={handleClose}
                  disabled={isSubmitting}
                  enableHaptics={!isSubmitting}
                  enableSound={true}
                  fullWidth
                >
                  Cancel
                </Button>
              </View>
              <View style={bugReportModalStyles.buttonWrapper}>
                <Button
                  variant="secondary"
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  enableHaptics={!isSubmitting}
                  enableSound={true}
                  fullWidth
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}