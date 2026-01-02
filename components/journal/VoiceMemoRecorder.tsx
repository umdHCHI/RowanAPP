import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from 'expo-audio'

// Note: expo-audio replaces deprecated expo-av for audio recording

interface VoiceMemoRecorderProps {
  onSave: (audioUri: string) => void
  theme?: any
}

export function VoiceMemoRecorder({ onSave, theme }: VoiceMemoRecorderProps) {
  const [recordedUri, setRecordedUri] = useState<string | null>(null)

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    // Status listener - called when recording status changes
    if (status.isFinished && status.url) {
      setRecordedUri(status.url)
      onSave(status.url)
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
        setRecordedUri(recorder.uri)
        onSave(recorder.uri)
      } else if (recorderState.url) {
        setRecordedUri(recorderState.url)
        onSave(recorderState.url)
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
    <View style={styles.container}>
      <View style={styles.recorderContainer}>
        {!recordedUri ? (
          <>
            {!isRecording ? (
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <MaterialCommunityIcons name="microphone" size={32} color="#ffffff" />
                <Text style={styles.recordButtonText}>Tap to Record</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.recordingContainer}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>{formatDuration(duration)}</Text>
                </View>
                <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                  <MaterialCommunityIcons name="stop" size={24} color="#ffffff" />
                  <Text style={styles.stopButtonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.recordedContainer}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.recordedText}>Voice memo saved</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialCommunityIcons name="delete-outline" size={20} color="#FFD700" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  recorderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  recordButtonText: {
    marginTop: 8,
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  recordingText: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F44336',
  },
  stopButtonText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  recordedContainer: {
    alignItems: 'center',
    gap: 12,
  },
  recordedText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
  },
})
