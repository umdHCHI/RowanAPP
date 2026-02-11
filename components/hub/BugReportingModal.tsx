import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getBugReportUrl } from '@/api/constants'
import { useHaptics } from '@/utils/useHaptics'

interface BugReportModalProps {
  visible: boolean
  onClose: () => void
}

export function BugReportModal({ visible, onClose }: BugReportModalProps) {
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const haptics = useHaptics()

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the bug you encountered.')
      return
    }

    haptics.mediumImpact()
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
        haptics.success()
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
      haptics.error()
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View>
          <View>
            <Text>Report a Bug</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text>
            Help us improve by reporting any issues you've encountered.
          </Text>

          <TextInput
            placeholder="Your email (optional)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />

          <TextInput
            placeholder="Describe the bug"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isSubmitting}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}