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
      const response = await fetch('/api/report-bug', {
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
        throw new Error('Failed to submit bug report')
      }
    } catch (error) {
      haptics.error()
      Alert.alert(
        'Error',
        'Failed to submit bug report. Please try again later.'
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