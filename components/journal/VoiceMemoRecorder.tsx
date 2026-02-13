import  { useState, useEffect } from 'react'
import { View,  TouchableOpacity,  Alert } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from 'expo-audio'
import { Text } from '@/components/ui'
import { journalVoiceRecorderStyles } from '@/styles/journal/journal-styles'
import {  VoiceMemoRecorderProps } from '@/types/journal/journal'





export function VoiceMemoRecorder({ onSave }: VoiceMemoRecorderProps) {
  const [recordedUri, setRecordedUri] = useState<string | null>(null)

  function toDurationSeconds(durationMillis?: number) {
    if (typeof durationMillis !== 'number' || Number.isNaN(durationMillis)) return 1
    const seconds = Math.round(durationMillis / 1000)
    return seconds > 0 ? seconds : 1
  }

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    // Status listener - called when recording status changes
    if (status.isFinished && status.url) {
      const durationSeconds = toDurationSeconds(recorderState.durationMillis ?? 0)
      setRecordedUri(status.url)
      onSave({ uri: status.url, durationSeconds })
    }
  })

  const recorderState = useAudioRecorderState(recorder, 1000) // Update every second

  async function startRecording() {
    try {
      // Request permissions
      const { granted } = await requestRecordingPermissionsAsync()
      if (!granted) {
        Alert.alert('Permission Denied', 'Audio recording permission is required.')
        return
      }

      setRecordedUri(null)
      await recorder.prepareToRecordAsync()
      recorder.record()
    } catch (error) {
      console.error('Error starting recording:', error)
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.')
    }
  }

  async function stopRecording() {
    try {
      await recorder.stop()
      // The uri will be available via recorder.uri after stopping
      if (recorder.uri) {
        const durationSeconds = toDurationSeconds(recorderState.durationMillis)
        setRecordedUri(recorder.uri)
        onSave({ uri: recorder.uri, durationSeconds })
      } else if (recorderState.url) {
        const durationSeconds = toDurationSeconds(recorderState.durationMillis)
        setRecordedUri(recorderState.url)
        onSave({ uri: recorderState.url, durationSeconds })
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      Alert.alert('Recording Error', 'Failed to stop recording.')
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isRecording = recorderState.isRecording
  const duration = Math.floor(recorderState.durationMillis / 1000) // Convert to seconds

  // Update recordedUri when recording finishes
  useEffect(() => {
    if (!isRecording && (recorder.uri || recorderState.url)) {
      const uri = recorder.uri || recorderState.url
      if (uri) {
        setRecordedUri(uri)
      }
    }
  }, [isRecording, recorder.uri, recorderState.url])

  function handleDelete() {
    setRecordedUri(null)
  }

  return (
    <View style={journalVoiceRecorderStyles.container}>
      <View style={journalVoiceRecorderStyles.recorderContainer}>
        {!recordedUri ? (
          <>
            {!isRecording ? (
              <TouchableOpacity style={journalVoiceRecorderStyles.recordButton} onPress={startRecording}>
                <MaterialDesignIcons name="microphone" size={32} color="#ffffff" />
                <Text variant="label" size={2} align="center">Tap to Record</Text>
              </TouchableOpacity>
            ) : (
              <View style={journalVoiceRecorderStyles.recordingContainer}>
                <View style={journalVoiceRecorderStyles.recordingIndicator}>
                  <View style={journalVoiceRecorderStyles.recordingDot} />
                  <Text variant="label" size={2} align="center">{formatDuration(duration)}</Text>
                </View>
                <TouchableOpacity style={journalVoiceRecorderStyles.stopButton} onPress={stopRecording}>
                  <MaterialDesignIcons name="stop" size={24} color="#ffffff" />
                  <Text variant="label" size={2} align="center">Stop</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={journalVoiceRecorderStyles.recordedContainer}>
            <MaterialDesignIcons name="check-circle" size={32} color="#4CAF50" />
            <Text variant="label" size={2} align="center">Voice memo saved</Text>
            <TouchableOpacity style={journalVoiceRecorderStyles.deleteButton} onPress={handleDelete}>
              <MaterialDesignIcons name="delete-outline" size={20} color="#FFD700" />
              <Text variant="label" size={2} align="center">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}
